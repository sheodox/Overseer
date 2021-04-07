import {Server} from "socket.io";
import {createSafeWebsocketHandler, SilverConduit} from "../util/silver-conduit";
import {ToastOptions} from "../types";
import {MaskedUser, users} from "../db/users";
import {eventsBooker} from "../db/booker";
import {eventsLogger} from "../util/logger";
import {EventDay, EventList, events, getEventDays, RSVPStatus} from "../db/events";
import {Event, Rsvp, RsvpDay} from "@prisma/client";
import MarkdownIt from "markdown-it";
const md = new MarkdownIt();

function cloneObject<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}

function pickProperties<Type, TProp extends keyof Type>(obj: Type, properties: TProp[]): Pick<Type, TProp> {
    const picked: any = {}
    for (const prop of properties)  {
        picked[prop] = obj[prop];
    }
    return picked;
}

type MaskedRsvpDay = Pick<RsvpDay, 'date' | 'stayingOvernight'>
interface MaskedRsvp extends Pick<Rsvp, 'status' | 'notes'> {
    user: MaskedUser,
    rsvpDays: MaskedRsvpDay[]
}
type RsvpStatusCounts = Record<RSVPStatus, number>;

interface DayAttendee extends Pick<RsvpDay, 'stayingOvernight'> {
    user: MaskedUser
}

interface MaskedEvent extends Omit<Event, 'creatorId' | 'startDate' | 'endDate'> {
    creator: MaskedUser,
    startDate: number,
    endDate: number,
    notesRendered: string,
    userRsvp?: MaskedRsvp,
    eventDays: EventDay[],
    rsvpStatusCounts: RsvpStatusCounts,
    attendeesByDay: (EventDay & {attendees: DayAttendee[]})[]
}

async function maskUser(userId: string) {
    return (await users.getMasked([userId]))[0]
}

async function maskRsvp(rsvp: Rsvp & {rsvpDays: RsvpDay[]}) {
    const rsvpDays: MaskedRsvpDay[] = [];

    for (const day of rsvp.rsvpDays) {
        rsvpDays.push({
            ...pickProperties(day, ['date', 'stayingOvernight'])
        })
    }

    return {
        ...pickProperties(rsvp, ['status', 'notes']),
        user: await maskUser(rsvp.userId),
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
            if (!userCanOrganize) {
                rsvp.notes = '';
            }
            rsvps.push(await maskRsvp(rsvp));
            const maskedUser = await maskUser(rsvp.userId);

            for (const day of rsvp.rsvpDays) {
                const eventDay = attendeesByDay.find(({date}) => date === day.date);
                if (eventDay) {
                    eventDay.attendees.push({
                        ...pickProperties(day, ['stayingOvernight']),
                        user: maskedUser
                    });
                }
            }
        }

        const userRsvp = event.rsvps.find(rsvp => rsvp.userId === userId);

        maskedEvents.push({
            ...pickProperties(event, [
                'id', 'notes', 'name', 'attendanceType', 'createdAt'
            ]),
            startDate: event.startDate.getTime(),
            endDate: event.endDate.getTime(),
            userRsvp: userRsvp ? await maskRsvp(userRsvp) : null,
            creator: await maskUser(event.creatorId),
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

module.exports = function(io: Server) {
    const ioConduit = new SilverConduit(io, 'events'),
        notificationConduit = new SilverConduit(io, 'notifications');

    io.on('connection', async socket => {
        const socketConduit = new SilverConduit(socket, 'events'),
            singleUserNotifications = new SilverConduit(socket, 'notifications'),
            userId = SilverConduit.getUserId(socket);

        if (!userId) {
            return;
        }

        async function broadcast() {
            const eventData = await events.list()

            ioConduit.filteredBroadcast('refresh', async userId => {
                if (await eventsBooker.check(userId, 'view')) {
                    return maskEvent(eventData, userId);
                }
            })
        }

        const user = await users.getUser(userId),
            displayName = user.displayName,
            checkPermission = createSafeWebsocketHandler(userId, eventsBooker, socket, eventsLogger);

        const singleUserError = (message: string) => {
            singleUserNotifications.emit('notification', {
                variant: 'error',
                title: 'Event Error',
                message,
            } as ToastOptions);
        };

        socketConduit.on({
            init: checkPermission('view', async () => {
                socketConduit.emit('refresh',
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