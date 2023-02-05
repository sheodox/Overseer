import { Server } from 'socket.io';
import { createSafeWebsocketHandler, Harbinger } from '../util/harbinger.js';
import { eventsBooker } from '../db/booker.js';
import { eventsLogger } from '../util/logger.js';
import { events } from '../db/events.js';
import { Rsvp, RsvpInterval } from '@prisma/client';
import MarkdownIt from 'markdown-it';
import { pickProperties } from '../util/object-manipulation.js';
import { Envoy } from '../../shared/envoy.js';
import { createNotificationsForPermittedUsers, sendToastToUser } from '../util/create-notifications.js';
import type { MaskedEvent, MaskedRsvp, EventList } from '../../shared/types/events';
import { deserialize, serialize } from 'onaji';
const md = new MarkdownIt();

function cloneObject<T>(obj: T): T {
	return deserialize<T>(serialize(obj));
}

function maskRsvp(rsvp: Rsvp) {
	return {
		...pickProperties(rsvp, ['status', 'notes', 'userId']),
	} as MaskedRsvp;
}

function identity<T>(item: T) {
	return item;
}

function maskRsvpInterval(userId: string) {
	return function (interval: RsvpInterval) {
		// hide notes for non-organizers
		return { ...interval, notes: interval.userId === userId ? interval.notes : '' };
	};
}

async function maskEvent(list: EventList, userId: string): Promise<MaskedEvent[]> {
	//don't let someone's permissions leak between users. otherwise notes will disappear
	//with broadcasts if we blank out notes because a user doesn't have permission to view them
	list = cloneObject(list);

	const maskedEvents = [],
		userCanOrganize = await eventsBooker.check(userId, 'organize');

	for (const event of list) {
		const rsvps: MaskedRsvp[] = [];

		for (const rsvp of event.rsvps) {
			//users need to be able to see their own RSVP notes so they can change it after the fact
			//but we want to hide anyone else's from them unless they're an organizer
			if (!userCanOrganize && rsvp.userId !== userId) {
				rsvp.notes = '';
			}
			rsvps.push(maskRsvp(rsvp));
		}

		maskedEvents.push({
			...pickProperties(event, ['id', 'notes', 'name', 'attendanceType', 'createdAt', 'creatorId']),
			startDate: event.startDate,
			endDate: event.endDate,
			notesRendered: md.render(event.notes),
			eventIntervalRsvps: event.eventIntervalRsvps.map(userCanOrganize ? identity : maskRsvpInterval(userId)),
			eventIntervals: event.eventIntervals,
			rsvps,
		});
	}
	return maskedEvents;
}

export async function getEventsData(userId: string) {
	const eventData = await events.list();
	return maskEvent(eventData, userId);
}

export const initEvents = function (io: Server) {
	const eventsHarbinger = new Harbinger('events');

	io.on('connection', async (socket) => {
		const eventsEnvoy = new Envoy(socket, 'events'),
			userId = Harbinger.getUserId(socket);

		if (!userId) {
			return;
		}

		async function broadcast() {
			const eventData = await events.list();

			eventsHarbinger.filteredBroadcast('init', async (userId) => {
				if (await eventsBooker.check(userId, 'view')) {
					return maskEvent(eventData, userId);
				}
			});
		}

		const checkPermission = createSafeWebsocketHandler(userId, eventsBooker, socket, eventsLogger);

		const singleUserError = (message: string) => {
			sendToastToUser(userId, {
				variant: 'error',
				title: 'Event Error',
				message,
			});
		};

		eventsEnvoy.on({
			init: checkPermission('view', async () => {
				eventsEnvoy.emit('init', await maskEvent(await events.list(), userId));
			}),
			createEvent: checkPermission('organize', async (data, intervals, done) => {
				const event = await events.createEvent(userId, data, intervals);
				if ('error' in event) {
					return singleUserError(event.error);
				}

				done(event.id);
				broadcast();

				createNotificationsForPermittedUsers(
					eventsBooker,
					'view',
					{
						title: 'Events',
						message: `New event "${event.name}" starting ${event.startDate.toLocaleString()}.`,
						href: `/events/${event.id}`,
					},
					'notifyNewEvents'
				);
			}),
			updateEvent: checkPermission('organize', async (id, data, intervals, clearRsvps, done) => {
				const event = await events.updateEvent(userId, id, data, intervals, clearRsvps);
				if (event && 'error' in event) {
					return singleUserError(event.error as string);
				}

				done();
				broadcast();
			}),
			deleteEvent: checkPermission('organize', async (id) => {
				await events.deleteEvent(id);
				broadcast();
			}),
			rsvp: checkPermission('rsvp', async (eventId, status, rsvpSurvey) => {
				const event = await events.rsvp(userId, eventId, status, rsvpSurvey);

				if ('error' in event) {
					return singleUserError(event.error);
				}
				broadcast();
			}),
		});
	});
};
