<style>

</style>

{#if !$eventsInitialized}
    <PageSpinner />
{:else}
    <div class="page-contents">
        <div class="f-row justify-content-between align-items-center">
            <h1>Events</h1>
            {#if window.Booker.events.organize}
                <Link href="/events/create">
                    <span class="button">
                        <Icon icon="plus" />
                        Create Event
                    </span>
                </Link>
            {/if}
        </div>

        <EventNotificationReminder on:refused={() => dontWantReminders = true} />

        {#if $ongoingEvents.length}
            <h2>Ongoing</h2>
            {#each $ongoingEvents as event}
                <EventPreview {event} showRSVP={true} />
            {/each}
        {/if}
        {#if $upcomingEvents.length}
            <h2>Upcoming</h2>
            {#each $upcomingEvents as event}
                <EventPreview {event} showRSVP={true} />
            {/each}
        {/if}
        {#if $pastEvents.length}
            <h2>Past</h2>
            {#each $pastEvents as event}
                <EventPreview {event} />
            {/each}
        {/if}

        {#if $events.length === 0}
            <p>There aren't any events yet.</p>
        {/if}
    </div>
{/if}

<script>
    import {Icon} from 'sheodox-ui';
    import Link from "../Link.svelte";
    import {eventsInitialized, events, ongoingEvents, upcomingEvents, pastEvents} from "../stores/events";
    import EventPreview from "./EventPreview.svelte";
    import PageSpinner from "../PageSpinner.svelte";
    import {pageName} from "../stores/app";
    import EventNotificationReminder from "./EventNotificationReminder.svelte";

    pageName.set('Events');
</script>