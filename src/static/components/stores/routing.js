import {writable} from "svelte/store";
import page from "page";

//the name of the header nav item this route lives within
export const activeApp = writable('');
//a rough pseudocode-y ID that corresponds to a component that's mounted in Routing.svelte
export const activeRoute = writable('');
export const activeRouteParams = writable({});
export const activeQueryParams = writable({});

function setRoute(app, routeId) {
    return (pageData) => {
        activeApp.set(app);
        activeRoute.set(routeId);
        activeRouteParams.set(pageData.params);
        const queryParams = {};
        for (const [param, value] of new URLSearchParams(pageData.querystring)) {
            queryParams[param] = decodeURIComponent(value);
        }
        activeQueryParams.set(queryParams);
    }
}

page(`/events`, setRoute('events', 'events'))
page(`/events/create`, setRoute('events', 'events/create'))
page(`/events/:eventId`, setRoute('events', 'events/view'))
page(`/events/:eventId/edit`, setRoute('events', 'events/edit'))
page(`/echo`, setRoute('echo', 'echo'))
page(`/echo/upload`, setRoute('echo', 'echo/upload'))
page(`/echo/:echoId`, setRoute('echo', 'echo/view'))
page(`/echo/:echoId/edit`, setRoute('echo', 'echo/edit'))
page(`/voter`, setRoute('voter', 'voter'))
page(`/voter/:raceId`, setRoute('voter', 'voter/race'))
page(`/`, setRoute('home', 'home'))
page();
