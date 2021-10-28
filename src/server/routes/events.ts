import {Server} from "socket.io";
import {createSafeWebsocketHandler, Harbinger} from "../util/harbinger";
import {eventsBooker} from "../db/booker";
import {eventsLogger} from "../util/logger";
import {EventDay, EventList, events, getEventDays, RSVPStatus} from "../db/events";
import {Event, Rsvp, RsvpDay} from "@prisma/client";
import MarkdownIt from "markdown-it";
import {users} from "../db/users";
import {pickProperties} from "../util/object-manipulation";
import {Envoy} from "../../shared/envoy";
import {createNotificationsForPermittedUsers, sendToastToUser} from "../util/create-notifications";
const md = new MarkdownIt();

function cloneObject<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

type MaskedRsvpDay = Pick<RsvpDay, 'date' | 'stayingOvernight'>
interface MaskedRsvp extends Pick<Rsvp, 'status' | 'notes' | 'userId'> {
    rsvpDays: MaskedRsvpDay[]
}
type RsvpStatusCounts = Record<RSVPStatus, number>;

type DayAttendee = Pick<RsvpDay, 'stayingOvernight' | 'userId'>;

interface MaskedEvent extends Omit<Event, 'startDate' | 'endDate' | 'remindedOneDay' | 'remindedOneHour'> {
    startDate: number,
    endDate: number,
    notesRendered: string,
    eventDays: EventDay[],
    rsvpStatusCounts: RsvpStatusCounts,
    attendeesByDay: (EventDay & {attendees: DayAttendee[]})[]
}

async function maskRsvp(rsvp: Rsvp & {rsvpDays: RsvpDay[]}) {
    const rsvpDays: MaskedRsvpDay[] = [];

    for (const day of rsvp.rsvpDays) {
        rsvpDays.push({
            ...pickProperties(day, ['date', 'stayingOvernight'])
        })
    }

    return {
        ...pickProperties(rsvp, ['status', 'notes', 'userId']),
        rsvpDays,
    }
}

async function maskEvent(list: EventList, userId: string): Promise<MaskedEvent[]> {
    //don't let someone's permissions leak between users. otherwise notes will disappear
    //with broadcasts if we blank out notes because a user doesn't have permission to view them
    list = cloneObject(list);

    const maskedEvents = [],
        userCanOrganize = await eventsBooker.check(userId, 'organize');

    for (const event of list) {
        //cloning the object turns Date objects into strings, turn them back!
        event.startDate = new Date(event.startDate);
        event.endDate = new Date(event.endDate);

        const rsvps: MaskedRsvp[] = [],
            eventDays = getEventDays(event),
            attendeesByDay = eventDays.map(day => {
                return {
                    ...day,
                    attendees: []
                }
            });

        for (const rsvp of event.rsvps) {
            //users need to be able to see their own RSVP notes so they can change it after the fact
            //but we want to hide anyone else's from them unless they're an organizer
            if (!userCanOrganize && rsvp.userId !== userId) {
                rsvp.notes = '';
            }
            rsvps.push(await maskRsvp(rsvp));

            for (const day of rsvp.rsvpDays) {
                const eventDay = attendeesByDay.find(({date}) => date === day.date);
                if (eventDay) {
                    eventDay.attendees.push({
                        ...pickProperties(day, ['stayingOvernight', 'userId']),
                    });
                }
            }
        }

        maskedEvents.push({
            ...pickProperties(event, [
                'id', 'notes', 'name', 'attendanceType', 'createdAt', 'creatorId'
            ]),
            startDate: event.startDate.getTime(),
            endDate: event.endDate.getTime(),
            notesRendered: md.render(event.notes),
            attendeesByDay,
            eventDays,
            rsvps,
            rsvpStatusCounts: event.rsvps.reduce((counts, rsvp) => {
                counts[rsvp.status as RSVPStatus] = (counts[rsvp.status as RSVPStatus] ?? 0) + 1
                return counts;
            }, {} as RsvpStatusCounts)
        })
    }
    return maskedEvents;
}

export async function getEventsData(userId: string) {
	const eventData = await events.list();
	return maskEvent(eventData, userId);
}

export const initEvents = function(io: Server) {
    const eventsHarbinger = new Harbinger('events');

    io.on('connection', async socket => {
        const eventsEnvoy = new Envoy(socket, 'events'),
            userId = Harbinger.getUserId(socket);

        if (!userId) {
            return;
        }

        async function broadcast() {
            const eventData = await events.list()

            eventsHarbinger.filteredBroadcast('init', async userId => {
                if (await eventsBooker.check(userId, 'view')) {
                    return maskEvent(eventData, userId);
                }
            })
        }

        const user = await users.getUser(userId),
            displayName = user.displayName,
            checkPermission = createSafeWebsocketHandler(userId, eventsBooker, socket, eventsLogger);

        const singleUserError = (message: string) => {
            sendToastToUser(userId, {
                variant: 'error',
                title: 'Event Error',
                message,
            });
        };

        eventsEnvoy.on({
            init: checkPermission('view', async () => {
                eventsEnvoy.emit('init',
                    await maskEvent(await events.list(), userId)
                );
            }),
            createEvent: checkPermission('organize', async (data, done) => {
                const event = await events.createEvent(userId, data);
                if ('error' in event) {
                    return singleUserError(event.error);
                }

                done(event.id);
                broadcast();

                createNotificationsForPermittedUsers(eventsBooker, 'view', {
                    title: 'Events',
                    message: `New event "${event.name}" starting ${event.startDate.toLocaleString()}.`,
                    href: `/events/${event.id}`,
                }, 'notifyNewEvents')
            }),
            updateEvent: checkPermission('organize', async (id, data, done) => {
                const event = await events.updateEvent(id, data);
                if ('error' in event) {
                    return singleUserError(event.error);
                }

                done(event.id);
                broadcast();
            }),
            deleteEvent: checkPermission('organize', async (id) => {
                await events.deleteEvent(id);
            }),
            rsvp: checkPermission('rsvp', async (eventId, status, rsvpSurvey) => {
                const event = await events.rsvp(userId, eventId, status, rsvpSurvey);

                if ('error' in event) {
                    return singleUserError(event.error);
                }
                broadcast();
            })
        })
    })
}
