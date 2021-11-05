import { writable } from 'svelte/store';
import page, { Context } from 'page';

//the name of the header nav item this route lives within
export const activeApp = writable<string>('');
//a rough pseudocode-y ID that corresponds to a component that's mounted in Routing.svelte
export const activeRoute = writable<string>('');
export const activeRouteParams = writable<Record<string, string>>({});
export const activeQueryParams = writable<Record<string, string>>({});

function setRoute(app: string, routeId: string) {
	return (context: Context) => {
		activeApp.set(app);
		activeRoute.set(routeId);
		activeRouteParams.set(context.params);

		const queryParams: Record<string, string> = {};
		for (const [param, value] of new URLSearchParams(context.querystring)) {
			queryParams[param] = decodeURIComponent(value);
		}
		activeQueryParams.set(queryParams);
	};
}

page(`/events`, setRoute('events', 'events'));
page(`/events/create`, setRoute('events', 'events/create'));
page(`/events/:eventId`, setRoute('events', 'events/view'));
page(`/events/:eventId/edit`, setRoute('events', 'events/edit'));
page(`/echo`, setRoute('echo', 'echo'));
page(`/echo/upload`, setRoute('echo', 'echo/upload'));
page(`/echo/:echoId`, setRoute('echo', 'echo/view'));
page(`/echo/:echoId/edit`, setRoute('echo', 'echo/edit'));
page(`/voter`, setRoute('voter', 'voter'));
page(`/voter/:raceId`, setRoute('voter', 'voter/race'));
page(`/settings`, setRoute('settings', 'settings'));
page(`/`, setRoute('home', 'home'));
page();
