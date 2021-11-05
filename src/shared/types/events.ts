import type { Event, Rsvp, RsvpDay } from '@prisma/client';
import type { RSVP_STATUSES } from '../../server/db/events';

export type MaskedRsvpDay = Pick<RsvpDay, 'date' | 'stayingOvernight'>;
export interface MaskedRsvp extends Pick<Rsvp, 'status' | 'notes' | 'userId'> {
	rsvpDays: RSVPSurveyDay[];
	status: RSVPStatus;
}
export type RsvpStatusCounts = Record<RSVPStatus, number>;

export type DayAttendee = Pick<RsvpDay, 'stayingOvernight' | 'userId'>;

export interface MaskedEvent extends Omit<Event, 'startDate' | 'endDate' | 'remindedOneDay' | 'remindedOneHour'> {
	startDate: Date;
	endDate: Date;
	notesRendered: string;
	eventDays: EventDay[];
	rsvpStatusCounts: RsvpStatusCounts;
	attendeesByDay: (EventDay & { attendees: DayAttendee[] })[];
	userRsvp?: MaskedRsvp;
	rsvps: MaskedRsvp[];
}

export type RSVPStatus = typeof RSVP_STATUSES[number];
export type EventEditable = Pick<Event, 'name' | 'notes' | 'attendanceType' | 'startDate' | 'endDate'>;
export interface EventDay {
	date: string; //date.toLocaleDateString()
	dayOfWeek: number; //date.getDay()
}
export interface RSVPSurveyDay {
	date: string; // should be a date from an EventDay, given back
	dayOfWeek?: number;
	going?: boolean;
	stayingOvernight?: boolean;
}
export interface RSVPSurvey {
	notes: string;
	days?: RSVPSurveyDay[];
}

export type EventList = (Event & { rsvps: (Rsvp & { rsvpDays: RsvpDay[] })[] })[];

export type EventsData = MaskedEvent[];
