<style>
    h1 {
        margin: 0 1rem 0 0;
    }
</style>

<div>
    <div class="f-row justify-content-center align-items-center">
        <h1>{eventTitle}</h1>
        <Link href="/events">
            <span class="fw-bold">
                Check out Events
                <Icon icon="chevron-right" />
            </span>
        </Link>
    </div>
    {#if $eventsInitialized}
        {#if mostRelevantEvent}
            <EventPreview event={mostRelevantEvent} />
        {:else}
            <p class="text-align-center"><em>No events.</em></p>
        {/if}
    {:else}
        <div class="text-align-center">
            <SpikeSpinner size="medium" />
        </div>
    {/if}
</div>

<script>
    import {Icon} from 'sheodox-ui';
    import {ongoingEvents, upcomingEvents, eventsInitialized, pastEvents} from "../stores/events";
    import EventPreview from "./EventPreview.svelte";
    import SpikeSpinner from "../SpikeSpinner.svelte";
    import Link from "../Link.svelte";

    let eventTitle = 'Events',
        mostRelevantEvent;

    $: findRelevantEvent($ongoingEvents, $upcomingEvents, $pastEvents);

    function findRelevantEvent(ongoing, upcoming, past) {
        if (ongoing.length) {
            mostRelevantEvent = ongoing[0];
            eventTitle = 'Ongoing Event'
        }
        else if (upcoming.length) {
            mostRelevantEvent = upcoming[0];
            eventTitle = 'Upcoming Event'
        }
        else if (past.length) {
            mostRelevantEvent = past[0];
            eventTitle = 'Past Event'
        }
    }
</script>