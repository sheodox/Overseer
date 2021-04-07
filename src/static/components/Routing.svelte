{#if $activeRoute === 'echo' && echo.view}
    <Echo />
{:else if $activeRoute === 'echo/upload' && echo.view && echo.upload}
    <EchoUpload mode="upload" />
{:else if $activeRoute === 'echo/edit' && echo.view && echo.update}
    <EchoUpload mode="edit" />
{:else if $activeRoute === 'echo/view' && echo.view}
    <EchoView />
{:else if $activeRoute === 'voter' && voter.view}
    <Voter />
{:else if $activeRoute === 'voter/race' && voter.view}
    <VoterRace />
{:else if $activeRoute === 'events' && events.view}
    <Events />
{:else if $activeRoute === 'events/create' && events.view && events.organize}
    <EventsEdit mode="create" />
{:else if $activeRoute === 'events/edit' && events.view && events.organize}
    <EventsEdit mode="edit" />
{:else if $activeRoute === 'events/view' && events.view}
    <EventView />
{:else if !echo.view && !voter.view && !events.view}
    <NoAccess />
{:else}
    <HomePage />
{/if}
<script>
    import {activeRoute} from './stores/routing';
    import Echo from "./echo/Echo.svelte";
    import EchoUpload from "./echo/EchoUpload.svelte";
    import EchoView from "./echo/EchoView.svelte";
    import Voter from "./voter/Voter.svelte";
    import VoterRace from "./voter/VoterRace.svelte";
    import Events from "./events/Events.svelte";
    import EventsEdit from "./events/EventsEdit.svelte";
    import NoAccess from "./NoAccess.svelte";
    import HomePage from "./HomePage.svelte";
    import EventView from "./events/EventView.svelte";

    //shortcuts to permissions!
    const echo = window.Booker.echo,
        voter = window.Booker.voter,
        events = window.Booker.events;
</script>