<style>
    .event {
        color: white;
    }
    .card {
        border-radius: 3px;
    }
</style>

<Link href="/events/{event.id}" noHoverStyles={true}>
    <div class="event">
        <div class="card clickable p-4">
            <div class="f-row justify-content-between align-items-baseline">
                <span class="shdx-font-size-5">
                    {event.name}
                </span>
            </div>

            <p class="my-3">
                <EventTimes {event} />
            </p>

            <div class="f-row justify-content-between">
                <span title="{attendees} {attendees === 1 ? 'person' : 'people'} going">
                    <Icon icon="user-friends" /> {attendees} <span class="sr-only">People Going</span>
                </span>

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
    import EventTimes from "./EventTimes.svelte";
    import RSVPStatus from "./RSVPStatus.svelte";

    export let event;

    $: start = event.startDate.toLocaleString();
    $: end = event.endDate.toLocaleString();
    $: attendees = event.rsvps.filter(({status}) => status === 'going').length;
</script>