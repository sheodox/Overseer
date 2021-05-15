<style>
</style>

<MenuButton triggerClasses="primary">
    <span slot="trigger"
          class="rsvp-button"
          class:warning={status  === 'going' && showFixGoingWarning}
    >
        {#if status}
            <RSVPStatus {status} />
        {:else}
            RSVP
        {/if}
        <Icon icon="chevron-down" />
    </span>
    <ul slot="menu">
        {#each statusOptions as statusOption}
            <li>
                <button on:click={() => rsvp(statusOption)}>
                    <RSVPStatus status={statusOption} />
                </button>
            </li>
        {/each}
    </ul>
</MenuButton>
{#if showFixGoingWarning}
    <p class="warning">
        You previously RSVP'd as going but the event is now held over multiple days. Please click "Going" again and select the days you're planning to attend!
    </p>
{/if}

<script>
    import {MenuButton, Icon} from 'sheodox-ui';
    import {createEventDispatcher} from 'svelte'
    import RSVPStatus from "./RSVPStatus.svelte";
    const dispatch = createEventDispatcher(),
        statusOptions = ['going', 'maybe', 'not-going'];

    export let status;
    export let showFixGoingWarning;

    function rsvp(newStatus) {
        dispatch('rsvp', newStatus);
    }
</script>