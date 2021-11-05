<style>
	.eventDay {
		margin: 0.2rem;
		padding: 0.5rem;
		border: 1px solid transparent;
		border-radius: 3px;
		transition: border-color 0.2s, background 0.2s;
	}
	.eventDay.going {
		border-color: var(--shdx-accent-blue);
		background: var(--shdx-accent-blue-dark);
	}
	fieldset {
		border: none;
	}
	textarea {
		width: 30rem;
		height: 6rem;
		max-width: 100%;
		resize: vertical;
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
						<Checkbox bind:checked={day.going} id="day-{day.date}-going">Going</Checkbox>
						{#if $eventFromRoute.attendanceType === 'real' && index !== days.length - 1 && day.going}
							<Checkbox bind:checked={day.stayingOvernight} id="day-{day.date}-staying-overnight">
								Staying overnight
							</Checkbox>
						{/if}
					</fieldset>
				</div>
			{/each}
		</div>
	{/if}
	<div>
		<label>
			Notes for the organizer
			<br />
			<textarea bind:value={notes} placeholder={getNotesPlaceholder(pendingStatus, $eventFromRoute.attendanceType)} />
		</label>
	</div>
	<div class="modal-footer">
		<button disabled={!submittable} on:click={rsvp}>Confirm</button>
	</div>
</div>

<script lang="ts">
	import Checkbox from 'sheodox-ui/Checkbox.svelte';
	import { eventFromRoute, eventOps, getDayOfWeekName } from '../stores/events';
	import { RSVPStatus, RSVPSurveyDay, EventDay } from '../../../shared/types/events';

	export let pendingStatus: RSVPStatus = null;
	export let visible: boolean;

	const previousResponse = $eventFromRoute.userRsvp,
		baseEventDays: RSVPSurveyDay[] = JSON.parse(JSON.stringify($eventFromRoute.eventDays)).map((dayInfo: EventDay) => {
			return {
				...dayInfo,
				going: false,
				stayingOvernight: false,
			};
		}),
		days = mergeMissingDays(previousResponse?.rsvpDays, baseEventDays);

	let notes = previousResponse?.notes ?? '';

	//if the event is one day only, we assume they're going the single day if they RSVP as going, so we don't show rsvp days
	$: goingSomeDay = days.length === 1 || days.some((day) => day.going);
	$: submittable = pendingStatus !== 'going' || goingSomeDay;

	function mergeMissingDays(rsvpDays: RSVPSurveyDay[], baseEventDays: RSVPSurveyDay[]): RSVPSurveyDay[] {
		if (!rsvpDays) {
			return baseEventDays;
		}
		return baseEventDays.map((baseDay) => {
			const existingRsvp = rsvpDays.find((day) => day.date === baseDay.date);
			if (existingRsvp) {
				return {
					...baseDay,
					...existingRsvp,
					going: true,
				};
			}
			return baseDay;
		});
	}

	function getNotesPlaceholder(status: string, attendanceType: string) {
		const generalAdvice = 'Anything you think the organizer should know.';
		let placeholder = '';
		if (status === 'going') {
			placeholder =
				attendanceType === 'virtual'
					? `Times you're not available during the event, requests, etc.`
					: 'Arrival times, special accommodations needed, food/games you plan to bring bring, etc.';
		}
		return `${placeholder} ${generalAdvice}`.trim();
	}
	function rsvp() {
		eventOps.rsvp($eventFromRoute.id, pendingStatus, {
			days,
			notes,
		});
		pendingStatus = null;
		visible = false;
	}
</script>
