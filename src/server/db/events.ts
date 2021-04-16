import Ajv from 'ajv';
import {Event, Rsvp, RsvpDay} from '@prisma/client';
import {prisma} from "./prisma";
import {name as validName} from "../util/validator";
import {createNotificationForUser} from "../util/create-notifications";
import {eventsBooker} from "./booker";
const ajv = new Ajv(),
    rsvpStatuses = ['going', 'not-going', 'maybe'] as const,
    validateEventEditable = ajv.compile({
        type: 'object',
        properties: {
            name: {type: 'string'},
            attendanceType: {enum: ['real', 'virtual']},
            notes: {type: 'string'},
            startDate: {type: 'number'},
            endDate: {type: 'number'},
        },
        additionalProperties: false
    }),
    validateRSPVStatus = ajv.compile({
        enum: rsvpStatuses
    }),
    HOUR_MS = 1000 * 60 * 60,
    DAY_MS = HOUR_MS * 24,
    UPCOMING_REMINDER_CHECK_MS = 1000 * 60;

export type RSVPStatus = typeof rsvpStatuses[number];
type EventEditable = Pick<Event, 'name' | 'notes' | 'attendanceType' | 'startDate' | 'endDate'>
export interface EventDay {
    date: string, //date.toLocaleDateString()
    dayOfWeek: number, //date.getDay()
}
interface RSVPSurveyDay {
    date: string, // should be a date from an EventDay, given back
    going: boolean,
    stayingOvernight: boolean,
}
interface RSVPSurvey {
    notes: string,
    days?: RSVPSurveyDay[]
}

export type EventList = (Event & {rsvps: (Rsvp & {rsvpDays: RsvpDay[]})[]})[]

function createRSVPDayValidator(eventDays: EventDay[]) {
    return ajv.compile({
        type: 'array',
        items: {
            type: 'object',
            properties: {
                date: {enum: eventDays.map(day => day.date)},
                going: {type: 'boolean'},
                stayingOvernight: {type: 'boolean'},
            }
        }
    });
}

export function getEventDays(event: Pick<Event, 'startDate' | 'endDate'>) {
    function getStartOfDay(date: Date) {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }

    function toEventDay(date: Date) {
        return {
            date: date.toLocaleDateString(),
            dayOfWeek: date.getDay()
        };
    }

    const days: EventDay[] = [toEventDay(getStartOfDay(event.startDate))],
        endTime = getStartOfDay(event.endDate).getTime();

    let dayDuringEvent = getStartOfDay(event.startDate).getTime() + DAY_MS;
    while (dayDuringEvent <= endTime) {
        days.push(toEventDay(getStartOfDay(new Date(dayDuringEvent))));
        dayDuringEvent += DAY_MS
    }

    return days;
}

function getMissingDays(oldDays: EventDay[], newDays: EventDay[]) {
    return oldDays.filter(({date}) => {
        return !newDays.some(newDay => newDay.date === date);
    }).map(({date}) => date);
}

async function notifyUpcoming() {
    const upcomingEvents = await prisma.event.findMany({
        where: {
            startDate: {
                //find events that start within a day from now
                gt: new Date(),
                lt: new Date(Date.now() + DAY_MS)
            }
        }
    });

    if (!upcomingEvents.length) {
        return;
    }

    const possibleAttendees = await eventsBooker.getUsersWithPermission('view');

    await Promise.all(upcomingEvents.map(async event => {
        //by virtue of appearing in the results we queried we know it's within range to send one day notifications
        if (!event.remindedOneDay) {
            await prisma.event.update({
                where: {id: event.id},
                data: {remindedOneDay: true}
            });

            for (const userId of possibleAttendees) {
                const rsvp = await prisma.rsvp.findUnique({
                    where: {
                        eventId_userId: {
                            eventId: event.id,
                            userId: userId
                        }
                    }
                });

                //don't send reminders to people who have already said they're not going
                if (!rsvp || rsvp.status !== 'not-going') {
                    const rsvpEncouragement = !rsvp ? ` Don't forget to RSVP.`: '';
                    createNotificationForUser(
                        userId,
                        {
                            title: `Events`,
                            message: `"${event.name}" starts a day from now!${rsvpEncouragement}`,
                            href: `/events/${event.id}`

                        }, 'notifyEventReminders'
                    )
                }
            }
        }

        const startsSoon = event.startDate.getTime() - Date.now() < HOUR_MS;
        if (!event.remindedOneHour && startsSoon) {
            await prisma.event.update({
                where: {id: event.id},
                data: {remindedOneHour: true}
            });

            for (const userId of possibleAttendees) {
                const rsvp = await prisma.rsvp.findUnique({
                    where: {
                        eventId_userId: {
                            eventId: event.id,
                            userId: userId
                        }
                    }
                });

                //don't send reminders to people who have already said they're not going
                if (!rsvp || rsvp.status !== 'not-going') {
                    const rsvpEncouragement = !rsvp ? ` Don't forget to RSVP.`: '';
                    createNotificationForUser(
                        userId,
                        {
                            title: `Events`,
                            message: `"${event.name}" starts in an hour!${rsvpEncouragement}`,
                            href: `/events/${event.id}`

                        }, 'notifyEventReminders'
                    )
                }
            }
        }
    }));
}
notifyUpcoming();
setInterval(notifyUpcoming, UPCOMING_REMINDER_CHECK_MS)

class Events {
    constructor() {}

    async list(): Promise<EventList> {
        return await prisma.event.findMany({
            orderBy: {
                startDate: 'desc'
            },
            include: {
                rsvps: {
                    include: {
                        rsvpDays: true
                    }
                },
            }
        });
    }

    validateEventData(data: EventEditable) {
        if (!validateEventEditable(data)) {
            return {error: 'Invalid data!'}
        }

        if (!validName(data.name)) {
            return {error: 'Invalid name.'};
        }

        if (data.startDate > data.endDate) {
            return {error: 'Start date must be before the end date.'}
        }
        return false;
    }

    async createEvent(userId: string, data: EventEditable) {
        const validationErrors = this.validateEventData(data);
        if (validationErrors) {
            return validationErrors;
        }

        data.startDate = new Date(data.startDate);
        data.endDate = new Date(data.endDate);

        const startTime = data.startDate.getTime();

        return await prisma.event.create({
            data: {
                ...data,
                creatorId: userId,
                //if the event is starting pretty soon there's no reason to notify them right away
                //when the 'new event' notification is fresh in their mind. if an event is created
                //that starts immediately you'd otherwise get all three created/reminder notifications at once
                remindedOneDay: startTime - Date.now() < 2 * DAY_MS,
                remindedOneHour: startTime - Date.now() < 2 * HOUR_MS,
            }
        })
    }
    async deleteEvent(eventId: string) {
        const whereEventId = {where: {eventId}};
        await prisma.$transaction([
            prisma.rsvpDay.deleteMany(whereEventId),
            prisma.rsvp.deleteMany(whereEventId),
            prisma.event.deleteMany({where: {id: eventId}})
        ])
    }
    async updateEvent(eventId: string, data: EventEditable) {
        const validationErrors = this.validateEventData(data);
        if (validationErrors) {
            return validationErrors;
        }

        data.startDate = new Date(data.startDate);
        data.endDate = new Date(data.endDate);

        const currentEvent = await prisma.event.findUnique({where: {id: eventId}}),
            existingDays = getEventDays(currentEvent),
            newDays = getEventDays(data),
            noLongerApplicableDays = getMissingDays(existingDays, newDays);

        await prisma.rsvpDay.deleteMany({
            where: {
                id: eventId,
                date: {
                    in: noLongerApplicableDays
                }
            }
        });

        return await prisma.event.update({
            where: {id: eventId},
            data,
            select: {
                id: true
            }
        })
    }
    async rsvp(userId: string, eventId: string, status: RSVPStatus, rsvpSurvey: RSVPSurvey) {
        if (!validateRSPVStatus(status)) {
            return {error: 'Invalid RSVP status!'}
        }
        const event = await prisma.event.findUnique({where: {id: eventId}});

        if (!event) {
            return {error: `Couldn't find that event!`};
        }

        //validate that all the days they're responding to are applicable for the days this event is held
        const surveyDayValidator = createRSVPDayValidator(
                getEventDays(event)
            ),
            validSurveyDays = status !== 'going' || surveyDayValidator(rsvpSurvey.days);

        if (!validSurveyDays) {
            return {error: 'Invalid survey response!'}
        }

        const relevantRspvResponse = {
            status,
            notes: rsvpSurvey.notes
        }

        //RSVPs are saved in two pieces, an RSVP which includes general information, like if they're going or not
        //and any notes for the organizer. the second piece is one or more "RSVPDays" which are individual rows
        //for each day during an event, showing which days they're going for a multiple day event
        const rsvp = await prisma.rsvp.upsert({
            where: {
                eventId_userId: {eventId, userId}
            },
            create: {
                eventId,
                userId,
                ...relevantRspvResponse
            },
            update: relevantRspvResponse
        });

        //delete the record of all days where the user may have said they were going, so if
        //they changed their mind after saying they're going they will not show up as going anywhere.
        //if they're going these will be replaced anyway
        await prisma.rsvpDay.deleteMany({
            where: {
                eventId, userId
            }
        });

        if (status === 'going') {
            //'rsvpSurvey.days' is validated, but not with 'additionalProperties: false'
            //so we need to be careful not to use object spread when putting this into
            //the database (front end builds these based on EventDays[], which has
            //additional properties we don't care about here
            const rsvpDayPromises = rsvpSurvey.days
                .filter(({going}) => going)
                .map(rsvpDay => {
                    return prisma.rsvpDay.create({
                        data: {
                            eventId,
                            userId,
                            rsvpId: rsvp.id,
                            date: rsvpDay.date,
                            stayingOvernight: rsvpDay.stayingOvernight
                        }
                    })
                });

            await prisma.$transaction(rsvpDayPromises);
        }
        return rsvp;
    }
}

export const events = new Events();