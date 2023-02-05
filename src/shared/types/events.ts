import type { Event, EventInterval as PrismaEventInterval, Rsvp, RsvpInterval } from '@prisma/client';
import type { RSVP_STATUSES } from '../../server/db/events';

export interface MaskedRsvp extends Pick<Rsvp, 'status' | 'notes' | 'userId'> {
	rsvpIntervals: RsvpInterval[];
	status: RSVPStatus;
}
export type RsvpStatusCounts = Record<RSVPStatus, number>;

export interface MaskedEvent extends Omit<Event, 'startDate' | 'endDate' | 'remindedOneDay' | 'remindedOneHour'> {
	startDate: Date;
	endDate: Date;
	notesRendered: string;
	eventIntervals: EventInterval[];
	eventIntervalRsvps: RsvpInterval[];
	userRsvp?: MaskedRsvp;
	rsvps: MaskedRsvp[];
}

export type RSVPStatus = typeof RSVP_STATUSES[number];
export type EventEditable = Pick<Event, 'name' | 'notes' | 'attendanceType' | 'startDate' | 'endDate'>;
export type EventInterval = PrismaEventInterval;

export interface EventIntervalEditable {
	id?: string; // only exists when editing an existing interval
	name: string;
	notes: string;
	canStayOvernight: boolean;
	startDate: Date;
	endDate: Date;
}

export interface RSVPIntervalEditable {
	eventIntervalId: string;
	notes: string;
	stayingOvernight: boolean;
	status: string;
}
export type RSVPInterval = RsvpInterval;

export interface RSVPSurvey {
	notes: string;
	intervals?: RSVPIntervalEditable[];
}

export type EventList = (Event & {
	eventIntervalRsvps: RsvpInterval[];
	rsvps: Rsvp[];
	eventIntervals: EventInterval[];
})[];

export type EventsData = MaskedEvent[];
