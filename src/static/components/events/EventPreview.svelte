<style>
    .event {
        color: white;
    }
    .sub-panel:hover {
        background: var(--shdx-sub-panel-bg-light)
    }
</style>

<Link href="/events/{event.id}" noHoverStyles={true}>
    <div class="event">
        <div class="sub-panel">
            <div class="f-row justify-content-between">
            <span class="fw-bold">
                <AttendanceTypeBadge {event} />
                {event.name}
            </span>
                <span title="{attendees} {attendees === 1 ? 'person' : 'people'} going">
                    <Icon icon="user-friends" /> {attendees} <span class="sr-only">People Going</span>
                </span>
            </div>

            <EventTimes {event} />

            <div class="f-row justify-content-end">
                {#if event.userRsvp}
                    <span>
                        <RSVPStatus status={event.userRsvp?.status} />
                    </span>
                {/if}
            </div>
        </div>
    </div>
</Link>

<script>
    import {Icon} from 'sheodox-ui';
    import Link from "../Link.svelte";
    import AttendanceTypeBadge from "./AttendanceTypeBadge.svelte";
    import EventTimes from "./EventTimes.svelte";
    import RSVPStatus from "./RSVPStatus.svelte";

    export let event;

    $: start = event.startDate.toLocaleString();
    $: end = event.endDate.toLocaleString();
    $: attendees = event.rsvps.filter(({status}) => status === 'going').length;
</script>