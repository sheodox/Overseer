import Ajv from 'ajv';
import { prisma } from './prisma.js';
import { name as validName } from '../../shared/validator.js';
import { createNotificationForUser } from '../util/create-notifications.js';
import { eventsBooker } from './booker.js';
import type {
	RSVPStatus,
	RSVPSurvey,
	EventEditable,
	EventList,
	EventIntervalEditable,
} from '../../shared/types/events';

export const RSVP_STATUSES = ['going', 'not-going', 'maybe'] as const;
const ajv = new Ajv(),
	validateEventEditable = ajv.compile({
		type: 'object',
		properties: {
			name: { type: 'string' },
			attendanceType: { enum: ['real', 'virtual'] },
			notes: { type: 'string' },
			// these are Date objects and json schema doesn't validate those
			startDate: {},
			endDate: {},
		},
		additionalProperties: false,
	}),
	validateIntervals = ajv.compile({
		type: 'array',
		minItems: 1,
		items: {
			type: 'object',
			properties: {
				id: { type: 'string' },
				name: { type: 'string' },
				notes: { type: 'string' },
				canStayOvernight: { type: 'boolean' },
				// these are Date objects and json schema doesn't validate those
				startDate: {},
				endDate: {},
			},
		},
		additionalProperties: false,
	}),
	getEditableIntervalProperties = (interval: EventIntervalEditable) => {
		return {
			name: interval.name,
			notes: interval.notes,
			canStayOvernight: interval.canStayOvernight,
			startDate: interval.startDate,
			endDate: interval.endDate,
		};
	},
	validateRSPVStatus = ajv.compile({
		enum: RSVP_STATUSES,
	}),
	HOUR_MS = 1000 * 60 * 60,
	DAY_MS = HOUR_MS * 24,
	UPCOMING_REMINDER_CHECK_MS = 1000 * 60;

async function notifyUpcoming() {
	const upcomingEvents = await prisma.event.findMany({
		where: {
			startDate: {
				//find events that start within a day from now
				gt: new Date(),
				lt: new Date(Date.now() + DAY_MS),
			},
		},
	});

	if (!upcomingEvents.length) {
		return;
	}

	const possibleAttendees = await eventsBooker.getUsersWithPermission('view');

	await Promise.all(
		upcomingEvents.map(async (event) => {
			//by virtue of appearing in the results we queried we know it's within range to send one day notifications
			if (!event.remindedOneDay) {
				await prisma.event.update({
					where: { id: event.id },
					data: { remindedOneDay: true },
				});

				for (const userId of possibleAttendees) {
					const rsvp = await prisma.rsvp.findUnique({
						where: {
							eventId_userId: {
								eventId: event.id,
								userId: userId,
							},
						},
					});

					//don't send reminders to people who have already said they're not going
					if (!rsvp || rsvp.status !== 'not-going') {
						const rsvpEncouragement = !rsvp ? ` Don't forget to RSVP.` : '';
						createNotificationForUser(
							userId,
							{
								title: `Events`,
								message: `"${event.name}" starts a day from now!${rsvpEncouragement}`,
								href: `/events/${event.id}`,
							},
							'notifyEventReminders'
						);
					}
				}
			}

			const startsSoon = event.startDate.getTime() - Date.now() < HOUR_MS;
			if (!event.remindedOneHour && startsSoon) {
				await prisma.event.update({
					where: { id: event.id },
					data: { remindedOneHour: true },
				});

				for (const userId of possibleAttendees) {
					const rsvp = await prisma.rsvp.findUnique({
						where: {
							eventId_userId: {
								eventId: event.id,
								userId: userId,
							},
						},
					});

					//don't send reminders to people who have already said they're not going
					if (!rsvp || rsvp.status !== 'not-going') {
						const rsvpEncouragement = !rsvp ? ` Don't forget to RSVP.` : '';
						createNotificationForUser(
							userId,
							{
								title: `Events`,
								message: `"${event.name}" starts in an hour!${rsvpEncouragement}`,
								href: `/events/${event.id}`,
							},
							'notifyEventReminders'
						);
					}
				}
			}
		})
	);
}
notifyUpcoming();
setInterval(notifyUpcoming, UPCOMING_REMINDER_CHECK_MS);

class Events {
	async list(): Promise<EventList> {
		return await prisma.event.findMany({
			orderBy: {
				startDate: 'desc',
			},
			include: {
				rsvps: {
					include: {
						rsvpInterval: true,
					},
				},
				eventIntervals: {
					orderBy: {
						startDate: 'asc',
					},
				},
				eventIntervalRsvps: true,
			},
		});
	}

	validateEventData(data: EventEditable) {
		if (!validateEventEditable(data) || ![data.startDate, data.endDate].every((date) => date instanceof Date)) {
			return { error: 'Invalid event data!' };
		}

		if (!validName(data.name)) {
			return { error: 'Invalid name.' };
		}

		const startDate = data.startDate.getTime(),
			endDate = data.endDate.getTime();

		if (isNaN(startDate) || isNaN(endDate)) {
			return { error: 'Invalid dates!' };
		}

		if (data.startDate > data.endDate) {
			return { error: 'Start date must be before the end date.' };
		}
		return false;
	}

	validateIntervals(intervals: EventIntervalEditable[]) {
		if (
			!validateIntervals(intervals) ||
			!intervals
				.map((int) => [int.endDate, int.startDate])
				.flat()
				.every((date) => date instanceof Date)
		) {
			console.log(validateIntervals.errors);
			return { error: 'Invalid interval data!' };
		}

		if (intervals.some(({ name }) => !validName(name))) {
			return { error: 'Invalid interval name.' };
		}

		for (const interval of intervals) {
			const startDate = interval.startDate.getTime(),
				endDate = interval.endDate.getTime();

			if (Number.isNaN(startDate) || Number.isNaN(endDate)) {
				return { error: 'Invalid interval dates!' };
			}
			if (startDate > endDate) {
				return { error: 'Interval start dates must be before the end dates.' };
			}
		}

		return false;
	}

	async createEvent(userId: string, data: EventEditable, intervals: EventIntervalEditable[]) {
		const validationErrors = this.validateEventData(data);
		if (validationErrors) {
			return validationErrors;
		}

		const intervalValidationErrors = this.validateIntervals(intervals);
		if (intervalValidationErrors) {
			return intervalValidationErrors;
		}

		const startTime = data.startDate.getTime();

		const createdEvent = await prisma.event.create({
			data: {
				...data,
				creatorId: userId,
				//if the event is starting pretty soon there's no reason to notify them right away
				//when the 'new event' notification is fresh in their mind. if an event is created
				//that starts immediately you'd otherwise get all three created/reminder notifications at once
				remindedOneDay: startTime - Date.now() < 2 * DAY_MS,
				remindedOneHour: startTime - Date.now() < 2 * HOUR_MS,
			},
		});

		await prisma.eventInterval.createMany({
			data: intervals.map((int) => {
				// intervals aren't validated for not including other props, be specific
				return {
					...getEditableIntervalProperties(int),
					creatorId: userId,
					eventId: createdEvent.id,
				};
			}),
		});

		return createdEvent;
	}
	async deleteEvent(eventId: string) {
		await prisma.rsvpInterval.deleteMany({ where: { eventId } });
		await prisma.rsvp.deleteMany({ where: { eventId } });
		await prisma.eventInterval.deleteMany({ where: { eventId } });
		await prisma.event.deleteMany({ where: { id: eventId } });
	}
	async updateEvent(
		userId: string,
		eventId: string,
		data: EventEditable,
		intervals: EventIntervalEditable[],
		clearRsvps: boolean
	) {
		const validationErrors = this.validateEventData(data);
		if (validationErrors) {
			return validationErrors;
		}

		const intervalValidationErrors = this.validateIntervals(intervals);
		if (intervalValidationErrors) {
			return intervalValidationErrors;
		}

		if (clearRsvps) {
			await prisma.rsvpInterval.deleteMany({ where: { eventId } });
			await prisma.rsvp.deleteMany({ where: { eventId } });
		}

		await prisma.event.update({
			where: { id: eventId },
			data,
			select: {
				id: true,
			},
		});

		const existingIntervals = await prisma.eventInterval.findMany({
				where: { eventId },
				select: {
					id: true,
				},
			}),
			deletedIntervals = existingIntervals.filter((int) => !intervals.some((i) => i.id === int.id));

		await Promise.all([
			...intervals.map((int) => {
				if (int.id) {
					return prisma.eventInterval.update({
						where: { id: int.id },
						data: {
							...getEditableIntervalProperties(int),
							creatorId: userId,
						},
					});
				}
				return prisma.eventInterval.create({
					data: {
						...getEditableIntervalProperties(int),
						creatorId: userId,
						eventId: eventId,
					},
				});
			}),
			// delete any intervals that aren't in the update, they were deleted
			...deletedIntervals.map(({ id }) => {
				return prisma.eventInterval.delete({ where: { id } });
			}),
		]);

		return {};
	}
	async rsvp(userId: string, eventId: string, status: RSVPStatus, rsvpSurvey: RSVPSurvey) {
		if (!validateRSPVStatus(status)) {
			return { error: 'Invalid RSVP status!' };
		}
		const event = await prisma.event.findUnique({ where: { id: eventId } });

		if (!event) {
			return { error: `Couldn't find that event!` };
		}

		const relevantRspvResponse = {
			status,
			notes: rsvpSurvey.notes,
		};

		//RSVPs are saved in two pieces, an RSVP which includes general information, like if they're going or not
		//and any notes for the organizer. the second piece is one or more "RSVPIntervals" which are individual rows
		//for segments of time during an event, showing which times they're going for a multiple day event
		const rsvp = await prisma.rsvp.upsert({
			where: {
				eventId_userId: { eventId, userId },
			},
			create: {
				eventId,
				userId,
				...relevantRspvResponse,
			},
			update: relevantRspvResponse,
		});

		//delete the record of all days where the user may have said they were going, so if
		//they changed their mind after saying they're going they will not show up as going anywhere.
		//if they're going these will be replaced anyway
		await prisma.rsvpInterval.deleteMany({
			where: {
				eventId,
				userId,
			},
		});

		if (status === 'going' || status === 'maybe') {
			const rsvpDayPromises = rsvpSurvey.intervals.map((rsvpInterval) => {
				return prisma.rsvpInterval.create({
					data: {
						eventId,
						userId,
						eventIntervalId: rsvpInterval.eventIntervalId,
						rsvpId: rsvp.id,
						status: rsvpInterval.status,
						stayingOvernight: rsvpInterval.stayingOvernight,
					},
				});
			});

			await prisma.$transaction(rsvpDayPromises);
		}
		return rsvp;
	}
}

export const events = new Events();
