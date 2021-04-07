<style>
    button[aria-pressed="true"] {
        border: 1px solid currentColor;
    }
    .going[aria-pressed="true"] {
        background-color: #20ff0021;
        color: #20ff00
    }
    .going[aria-pressed="true"].warning {
        background-color: #ffff0021;
        color: #ff0;
    }
    .not-going[aria-pressed="true"] {
        background-color: #ff000021;
        color: #ff0000
    }
    .maybe[aria-pressed="true"] {
        background-color: #f4f4f421;
        color: #f4f4f4
    }
    .warning {
        color: yellow;
        font-style: italic;
    }
</style>

<div class="f-row justify-content-center">
    {#each statusOptions as statusOption}
        <button
            class="{statusOption}"
            class:warning={statusOption  === 'going' && showFixGoingWarning}
            class:muted={highlight && highlight !== statusOption}
            aria-pressed={statusOption === status}
            on:click={() => rsvp(statusOption)}
        >
            <RSVPStatus status={statusOption} />
        </button>
    {/each}
</div>
{#if showFixGoingWarning}
    <p class="warning">
        You previously RSVP'd as going but the event is now held over multiple days. Please click "Going" again and select the days you're planning to attend!
    </p>
{/if}

<script>
    import {createEventDispatcher} from 'svelte'
    import RSVPStatus from "./RSVPStatus.svelte";
    const dispatch = createEventDispatcher(),
        statusOptions = ['going', 'maybe', 'not-going'];

    export let status;
    export let highlight;
    export let showFixGoingWarning;

    function rsvp(newStatus) {
        dispatch('rsvp', newStatus);
    }
</script>