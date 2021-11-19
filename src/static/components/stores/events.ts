import { writable, derived, get } from 'svelte/store';
import { socket } from '../../socket';
import page from 'page';
import { Envoy } from '../../../shared/envoy';
import { activeRouteParams } from './routing';
import { appBootstrap, booker, user } from './app';
import type { EventEditable, EventsData, MaskedEvent, RSVPSurvey } from '../../../shared/types/events';
const eventsEnvoy = new Envoy(socket, 'events', true);

const initialEventsData = appBootstrap.initialData.events;
export const eventsInitialized = writable(!!initialEventsData);
export const events = writable<EventsData>(initialEventsData ? parseEventsData(initialEventsData) : [], (set) => {
	if (!booker.events.view) {
		return;
	}

	if (!get(eventsInitialized)) {
		eventsEnvoy.emit('init');
	}
});
eventsEnvoy.on({
	init: (data) => {
		data = parseEventsData(data);
		events.set(data);
		eventsInitialized.set(true);
	},
});

function parseEventsData(data: EventsData) {
	const userId = user.id;

	return data.map((event) => {
		event.userRsvp = event.rsvps.find((rsvp) => rsvp.userId === userId) ?? null;
		return event;
	});
}

function sortAsc(events: EventsData) {
	events.sort((a, b) => {
		return a.startDate.getTime() - b.startDate.getTime();
	});
	return events;
}
function sortDesc(events: EventsData) {
	events.sort((a, b) => {
		return b.startDate.getTime() - a.startDate.getTime();
	});
	return events;
}

export const ongoingEvents = derived(events, (events) => {
	const now = Date.now();

	//ongoing events should show the soonest event first
	return sortAsc(
		events.filter((event) => {
			return event.startDate.getTime() < now && now < event.endDate.getTime();
		})
	);
});
export const upcomingEvents = derived(events, (events) => {
	const now = Date.now();

	return sortAsc(
		events.filter((event) => {
			return now < event.startDate.getTime();
		})
	);
});
export const pastEvents = derived(events, (events) => {
	const now = Date.now();

	return sortDesc(
		events.filter((event) => {
			return event.endDate.getTime() < now;
		})
	);
});
export const eventFromRoute = derived([events, activeRouteParams], ([events, routeParams]) => {
	return events.find((event) => {
		return event.id === routeParams.eventId;
	});
});

const daysOfTheWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export function getDayOfWeekName(dayIndex: number) {
	return daysOfTheWeek[dayIndex];
}

export const eventOps = {
	createEvent: (data: EventEditable) => {
		eventsEnvoy.emit('createEvent', data, (id: string) => {
			if (id) {
				page(`/events/${id}`);
			}
		});
	},
	updateEvent: (id: string, data: EventEditable) => {
		eventsEnvoy.emit('updateEvent', id, data, (id: string) => {
			if (id) {
				page(`/events/${id}`);
			}
		});
	},
	deleteEvent: (id: string) => {
		eventsEnvoy.emit('deleteEvent', id);
		page('/events');
	},
	rsvp: (eventId: string, rsvpStatus: string, survey: RSVPSurvey) => {
		eventsEnvoy.emit('rsvp', eventId, rsvpStatus, survey);
	},
};
