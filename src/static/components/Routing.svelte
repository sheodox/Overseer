{#if $activeRoute === 'echo' && echo.view}
	<Echo />
{:else if $activeRoute === 'echo/upload' && echo.view && echo.upload}
	<EchoUpload mode={EchoUploadMode.Upload} />
{:else if $activeRoute === 'echo/edit' && echo.view && echo.update}
	<EchoUpload mode={EchoUploadMode.Edit} />
{:else if $activeRoute === 'echo/view' && echo.view}
	<EchoView />
{:else if $activeRoute === 'voter' && voter.view}
	<Voter />
{:else if $activeRoute === 'voter/race' && voter.view}
	<VoterRace />
{:else if $activeRoute === 'events' && events.view}
	<Events />
{:else if $activeRoute === 'events/create' && events.view && events.organize}
	<EventsEdit mode={EventsEditMode.Create} />
{:else if $activeRoute === 'events/edit' && events.view && events.organize}
	<EventsEdit mode={EventsEditMode.Edit} />
{:else if $activeRoute === 'events/view' && events.view}
	<EventView />
{:else if $activeRoute === 'settings'}
	<Settings />
{:else if !echo.view && !voter.view && !events.view}
	<NoAccess />
{:else}
	<HomePage />
{/if}

<script lang="ts">
	import { activeRoute } from './stores/routing';
	import { booker } from './stores/app';
	import Echo from './echo/Echo.svelte';
	import EchoUpload, { EchoUploadMode } from './echo/EchoUpload.svelte';
	import EchoView from './echo/EchoView.svelte';
	import Voter from './voter/Voter.svelte';
	import VoterRace from './voter/VoterRace.svelte';
	import Events from './events/Events.svelte';
	import EventsEdit, { EventsEditMode } from './events/EventsEdit.svelte';
	import NoAccess from './NoAccess.svelte';
	import HomePage from './HomePage.svelte';
	import EventView from './events/EventView.svelte';
	import Settings from './settings/Settings.svelte';

	//shortcuts to permissions!
	const echo = booker.echo,
		voter = booker.voter,
		events = booker.events;
</script>
