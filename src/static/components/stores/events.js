import {writable, derived, get} from "svelte/store";
import {socket} from "../../socket";
import page from 'page';
import {Conduit} from "../../../shared/conduit";
import {activeRouteParams} from "./routing";
const eventConduit = new Conduit(socket, 'events');

export const eventsInitialized = writable(false);
export const events = writable([], set => {
    if (!window.Booker.events.view) {
        return;
    }

    if (!get(eventsInitialized)) {
        eventConduit.emit('init');
    }
});
function sortAsc(events) {
    events.sort((a, b) => {
        return a.startDate.getTime() - b.startDate.getTime();
    });
    return events;
}
function sortDesc(events) {
    events.sort((a, b) => {
        return b.startDate.getTime() - a.startDate.getTime();
    });
    return events;
}
export const ongoingEvents = derived(events, events => {
    const now = Date.now();

    //ongoing events should show the soonest event first
    return sortAsc(events.filter(event => {
        return event.startDate.getTime() < now && now < event.endDate.getTime();
    }));
});
export const upcomingEvents = derived(events, events => {
    const now = Date.now();

    return sortAsc(events.filter(event => {
        return now < event.startDate.getTime();
    }));
});
export const pastEvents = derived(events, events => {
    const now = Date.now();

    return sortDesc(events.filter(event => {
        return event.endDate.getTime() < now;
    }));
});
export const eventFromRoute = derived([events, activeRouteParams], ([events, routeParams]) => {
    return events.find(event => {
        return event.id === routeParams.eventId;
    })
})

eventConduit.on({
    refresh: data => {
        const userId = window.user.id;

        data.forEach(event => {
            event.startDate = new Date(event.startDate);
            event.endDate = new Date(event.endDate);
            event.userRsvp = event.rsvps.find(rsvp => rsvp.userId === userId) ?? null
        })
        events.set(data);
        eventsInitialized.set(true);
    }
})

const daysOfTheWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
export function getDayOfWeekName(dayIndex) {
    return daysOfTheWeek[dayIndex];
}

export const eventOps = {
    createEvent: (data) => {
        eventConduit.emit('createEvent', data, id => {
            if (id) {
                page(`/events/${id}`);
            }
        })
    },
    updateEvent: (id, data) => {
        eventConduit.emit('updateEvent', id, data, id => {
            if (id) {
                page(`/events/${id}`);
            }
        })
    },
    deleteEvent: (id) => {
        eventConduit.emit('deleteEvent', id);
        page('/events')
    },
    rsvp: (eventId, rsvpStatus, survey) => {
        eventConduit.emit('rsvp', eventId, rsvpStatus, survey);
    }
}
