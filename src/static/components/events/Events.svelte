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
                    <span class="button primary">
                        <Icon icon="plus" />
                        Create Event
                    </span>
                </Link>
            {/if}
        </div>

        <EventNotificationReminder />

        {#if $ongoingEvents.length}
            <h2>Ongoing</h2>
            <div class="f-column gap-3">
                {#each $ongoingEvents as event}
                    <EventPreview {event} showRSVP={true} />
                {/each}
            </div>
        {/if}
        {#if $upcomingEvents.length}
            <h2>Upcoming</h2>
            <div class="f-column gap-3">
                {#each $upcomingEvents as event}
                    <EventPreview {event} showRSVP={true} />
                {/each}
            </div>
        {/if}
        {#if $pastEvents.length}
            <h2>Past</h2>
            <div class="f-column gap-3">
                {#each $pastEvents as event}
                    <EventPreview {event} />
                {/each}
            </div>
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