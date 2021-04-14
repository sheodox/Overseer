<style>
    .sub-panel {
        margin: 1rem 0.5rem;
        padding: 1rem;
    }
    .details {
        flex-basis: 30rem;
        background: none;
    }
    h1 {
        margin: 0;
    }
</style>

{#if !$eventsInitialized}
    <PageSpinner />
{:else if !$eventFromRoute}
    <p>Couldn't find an event for this ID, did it get deleted?</p>
    <p><Link href="/events">Back to the events list.</Link></p>
{:else}
    <div class="page-content">
        <div class="f-row f-wrap justify-content-center align-items-start">
            <div class="f-1">
                <div class="sub-panel details">
                    <div class="f-row justify-content-between align-items-center">
                        <h1>{$eventFromRoute.name}</h1>
                        {#if window.Booker.events.organize}
                            <MenuButton>
                                <span slot="trigger">
                                    Options
                                    <Icon icon="chevron-down" />
                                </span>
                                <ul slot="menu">
                                    <li>
                                        <button on:click={() => page(`/events/${$eventFromRoute.id}/edit`)}>
                                            <Icon icon="edit" />
                                            Edit
                                        </button>
                                    </li>
                                    <li>
                                        <button on:click={() => showDeleteConfirm = true}>
                                            <Icon icon="trash" />
                                            Delete
                                        </button>
                                    </li>
                                </ul>
                            </MenuButton>
                        {/if}
                    </div>

                    <div class="f-row justify-content-between align-items-start f-wrap">
                        <div>
                            <p>
                                <AttendanceTypeBadge event={$eventFromRoute} showText={true} />
                            </p>
                            <EventTimes event={$eventFromRoute} />
                        </div>

                        {#if window.Booker.events.rsvp}
                            <RSVP
                                highlight={pendingStatus}
                                status={userRsvp?.status}
                                showFixGoingWarning={userGoing && isMultipleDays && !userRsvp?.rsvpDays.length}
                                on:rsvp={rsvpPrompt}
                            />
                        {/if}
                    </div>

                    <div class="notes">
                        {@html $eventFromRoute.notesRendered}
                    </div>
                </div>
                <div class="f-row f-wrap justify-content-between">
                    {#if window.Booker.events.organize}
                        <RSVPNotes rsvps={$eventFromRoute.rsvps} />
                    {/if}
                </div>
            </div>
            <div class="sub-panel">
                <Attendees event={$eventFromRoute} />
            </div>
        </div>

    </div>
{/if}

{#if showSurvey}
    <Modal bind:visible={showSurvey} title={pendingStatusName} on:closed={() => pendingStatus = null}>
        <RSVPSurvey bind:pendingStatus bind:visible={showSurvey} />
    </Modal>
{/if}
{#if showDeleteConfirm}
    <Modal bind:visible={showDeleteConfirm} title="Delete Event">
        <div class="modal-body">
            Are you sure you want to delete the event "{$eventFromRoute.name}"?
        </div>
        <div class="modal-footer">
            <button on:click={() => showDeleteConfirm = false}>
                Cancel
            </button>
            <button on:click={deleteEvent} class="danger">
                <Icon icon="trash" />
                Delete
            </button>
        </div>
    </Modal>
{/if}

<script>
    import {MenuButton, Icon, Modal} from 'sheodox-ui';
    import {pageName} from "../stores/app";
    import PageSpinner from "../PageSpinner.svelte";
    import {eventFromRoute, eventOps, eventsInitialized} from "../stores/events";
    import page from 'page';
    import Link from "../Link.svelte";
    import RSVP from "./RSVP.svelte";
    import RSVPSurvey from "./RSVPSurvey.svelte";
    import AttendanceTypeBadge from "./AttendanceTypeBadge.svelte";
    import Attendees from "./Attendance.svelte";
    import EventTimes from "./EventTimes.svelte";
    import RSVPNotes from "./RSVPNotes.svelte";

    let pendingStatus,
        showDeleteConfirm = false,
        showSurvey = false;

    $: pendingStatusName = {going: 'Going', 'not-going': 'Not Going', maybe: 'Maybe'}[pendingStatus];
    $: userRsvp = $eventFromRoute?.userRsvp
    $: isMultipleDays = $eventFromRoute?.eventDays.length > 1
    $: userGoing = userRsvp?.status === 'going'

    $: $pageName = $eventFromRoute?.name ?? 'Events'

    function rsvpPrompt(e) {
        pendingStatus = e.detail;
        showSurvey = true;
    }

    function deleteEvent() {
        eventOps.deleteEvent($eventFromRoute.id);
    }
</script>