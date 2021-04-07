<style>
    .eventDay {
        margin: 0.2rem;
        padding: 0.5rem;
        border: 1px solid transparent;
        border-radius: 3px;
        transition: border-color 0.2s, background 0.2s;
    }
    .eventDay.going {
        border-color: var(--accent-blue);
        background: var(--accent-blue-dark);
    }
    fieldset {
        border: none;
    }
    textarea {
        width: 30rem;
        height: 6rem;
        max-width: 90vw;
        resize: vertical;
    }
    .disabled {
        opacity: 0;
    }
</style>

<div class="modal-body">
    {#if days.length > 1 && pendingStatus === 'going'}
        <p>Which days are you attending?</p>
        <div class="f-row f-wrap">
            {#each days as day, index}
                <div class="eventDay" class:going={day.going}>
                    <fieldset>
                        <legend><strong>{getDayOfWeekName(day.dayOfWeek)}</strong> {day.date}</legend>
                        <label>
                            <input bind:checked={day.going} type="checkbox"/>
                            Going
                        </label>
                        <br>
                        {#if $eventFromRoute.attendanceType === 'real' && index !== days.length - 1}
                            <label class:disabled={!day.going}>
                                <input bind:checked={day.stayingOvernight} type="checkbox" disabled={!day.going} />
                                Staying overnight
                            </label>
                        {/if}
                    </fieldset>
                </div>
            {/each}
        </div>
    {/if}
    <div>
        <label>
            Notes for the organizer
            <br>
            <textarea
                bind:value={notes}
                placeholder="{getNotesPlaceholder(pendingStatus, $eventFromRoute.attendanceType)} Anything you think the organizer should know."
            ></textarea>
        </label>
    </div>
    <div class="modal-footer">
        <button disabled={!submittable} on:click={rsvp}>Confirm</button>
    </div>
</div>

<script>
    import {eventFromRoute, eventOps, getDayOfWeekName} from "../stores/events";

    export let pendingStatus;
    export let visible;

    const previousResponse = $eventFromRoute.userRsvp,
        baseEventDays = JSON.parse(JSON.stringify($eventFromRoute.eventDays)).map(dayInfo => {
            return {
                ...dayInfo,
                going: false,
                stayingOvernight: false
            }
        }),
        days = mergeMissingDays(previousResponse?.rsvpDays, baseEventDays);

    let notes = previousResponse?.notes ?? '';

    //if the event is one day only, we assume they're going the single day if they RSVP as going, so we don't show rsvp days
    $: goingSomeDay = days.length === 1 || days.some(day => day.going);
    $: submittable = pendingStatus !== 'going' || goingSomeDay;
    $: statusName = {going: 'Going', 'not-going': 'Not Going', maybe: 'Maybe'}[pendingStatus];

    function mergeMissingDays(rsvpDays, baseEventDays) {
        if (!rsvpDays) {
            return baseEventDays;
        }
        return baseEventDays.map(baseDay => {
            const existingRsvp = rsvpDays.find(day => day.date === baseDay.date);
            if (existingRsvp) {
                return {
                    ...baseDay,
                    ...existingRsvp,
                    going: true
                }
            }
            return baseDay;
        })
    }

    function getNotesPlaceholder(status, attendanceType) {
        if (status === 'going') {
            attendanceType === 'virtual' ?
                `Times you're not available during the event, requests, etc.` :
                'Arrival times, special accommodations needed, food/games you plan to bring bring, etc.';
        }
        return '';
    }
    function rsvp() {
        eventOps.rsvp($eventFromRoute.id, pendingStatus, {
            days,
            notes
        })
        pendingStatus = null;
        visible = false;
    }
</script>