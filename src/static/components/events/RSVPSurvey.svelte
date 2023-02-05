<style>
	.notes {
		white-space: pre-line;
	}
	textarea {
		min-height: 5rem;
		width: 100%;
	}
</style>

{#if $eventFromRoute}
	<PageLayout title={$eventFromRoute.name}>
		<div>
			<div class="f-column gap-5">
				<Fieldset legend="Are you attending this event?" fieldsetClasses="f-column">
					<div class="sx-toggles align-self-start f-row">
						{#each statuses as s}
							{@const inputId = `event-status-${s.value}`}
							<input bind:group={status} type="radio" id={inputId} value={s.value} />
							<label for={inputId} class="sx-font-size-5">{s.text}</label>
						{/each}
					</div>
				</Fieldset>
				<label class="f-column"
					><span>Notes to the organizer (optional)</span>
					<textarea bind:value={notes} />
				</label>
			</div>
			{#if status === 'going' || status === 'maybe'}
				<h2 class="mb-0">Itinerary</h2>
				<div class="f-column gap-5">
					{#each rsvpIntervals as rsvp}
						{@const interval = $eventFromRoute.eventIntervals.find((int) => int.id === rsvp.eventIntervalId)}
						<Fieldset legend={interval.name} fieldsetClasses="f-column gap-3">
							<p class="m-0 muted">
								<EventTimes startDate={interval.startDate} endDate={interval.endDate} />
							</p>
							<p class="notes m-0">
								{interval.notes}
							</p>
							<Fieldset legend="Are you attending this part?" fieldsetClasses="f-column gap-3">
								<div class="sx-toggles align-self-start f-row">
									{#each statuses as s}
										{@const inputId = `event-${interval.id}-status-${s.value}`}
										<input bind:group={rsvp.status} type="radio" id={inputId} value={s.value} />
										<label for={inputId}>{s.text}</label>
									{/each}
								</div>
								{#if interval.canStayOvernight && rsvp.status !== 'not-going'}
									<Checkbox bind:checked={rsvp.stayingOvernight}>Staying overnight</Checkbox>
								{/if}
							</Fieldset>
						</Fieldset>
					{/each}
				</div>
			{/if}
			{#if goingToEventButNoIntervals}
				<p class="sx-badge-red py-3">You are attending the event, but said no to everything on the itinerary.</p>
			{/if}
			{#if missingStatus}
				<p class="sx-badge-red py-3">You haven't answered all of the questions.</p>
			{/if}
			<div class="f-row justify-content-end">
				<Link href={eventPageUrl} classes="button secondary">Cancel</Link>
				<button class="primary" on:click={submit} disabled={!surveyValid}>Submit RSVP</button>
			</div>
		</div>
	</PageLayout>
{/if}

<script lang="ts">
	import { Fieldset, Checkbox } from 'sheodox-ui';
	import { eventFromRoute, eventOps } from '../stores/events';
	import PageLayout from '../../layouts/PageLayout.svelte';
	import EventTimes from './EventTimes.svelte';
	import Link from '../Link.svelte';
	import page from 'page';
	import type { EventInterval, MaskedEvent, RSVPInterval, RSVPIntervalEditable } from '../../../shared/types/events';

	let rsvpIntervals: RSVPIntervalEditable[];
	let status: string;
	let notes: string;

	$: initialize($eventFromRoute);

	$: eventPageUrl = `/events/${$eventFromRoute.id}`;

	$: mightGoToEvent = status && (status === 'going' || status === 'maybe');
	$: missingStatus = mightGoToEvent && rsvpIntervals.some((r) => !r.status);
	$: isGoingToAnInterval = rsvpIntervals.some((r) => r.status === 'going' || r.status === 'maybe');
	$: goingToEventButNoIntervals = mightGoToEvent && rsvpIntervals.every((r) => r.status === 'not-going');
	$: surveyValid = status && (status === 'not-going' || isGoingToAnInterval);

	let initialized = false;
	function initialize(event: MaskedEvent) {
		if (!initialized) {
			initialized = true;
			rsvpIntervals = seedIntervals(event.userRsvp?.rsvpIntervals ?? [], event.eventIntervals);
			status = event.userRsvp?.status;
			notes = event.userRsvp?.notes;
		}
	}

	const statuses = [
		{ value: 'going', text: 'Yes' },
		{ value: 'maybe', text: 'Maybe' },
		{ value: 'not-going', text: 'No' },
	];

	// merge existing RSVPs for each interval with the actual ones the event has, so they can RSVP to stuff they haven't yet
	function seedIntervals(rsvps: RSVPIntervalEditable[], eventIntervals: EventInterval[]) {
		return eventIntervals.map((int) => {
			const existingRsvp = rsvps.find((r) => r.eventIntervalId === int.id);

			return (
				existingRsvp ?? {
					eventIntervalId: int.id,
					notes: '',
					status: '',
					stayingOvernight: false,
				}
			);
		});
	}

	function submit() {
		eventOps.rsvp($eventFromRoute.id, status, {
			intervals: rsvpIntervals,
			notes,
		});

		page(eventPageUrl);
	}
</script>
