<style>
    h2 {
        margin: 0;
    }
</style>

<div class="attendees">
    <div class="f-row justify-content-between align-items-center">
        <h2>RSVPs</h2>
        {#if rsvps.length && event.eventDays.length > 1}
            <button on:click={() => showDetails = true}>
                Details
            </button>
        {/if}
    </div>
    {#if rsvps.length}
        <div class="f-row f-wrap">
            <Attendees rsvps={going} title="Going" />
            <Attendees rsvps={maybe} title="Maybe" />
            <Attendees rsvps={notGoing} title="Not Going" />
        </div>
    {:else}
        <p><em>Nobody has responded yet.</em></p>
    {/if}
</div>

{#if showDetails}
    <Modal bind:visible={showDetails} title="Attendee Details">
        <AttendeeDetails {event} />
    </Modal>
{/if}

<script>
    import {Modal} from 'sheodox-ui';
    import Attendees from "./Attendees.svelte";
    import AttendeeDetails from "./AttendeeDetails.svelte";

    export let event;

    let showDetails = false;

    function byStatus(status) {
        return rsvp => {
            return rsvp.status === status;
        }
    }

    $: rsvps = event.rsvps
    $: days = event.attendeesByDay
    $: going = event.rsvps.filter(byStatus('going'));
    $: notGoing = event.rsvps.filter(byStatus('not-going'));
    $: maybe = event.rsvps.filter(byStatus('maybe'));
    $: showDayBreakdown = days.length > 1 && going.length

</script>
