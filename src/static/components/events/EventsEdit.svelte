<style lang="scss">
	textarea {
		width: 100%;
		height: 10rem;
		font-size: 0.9rem;
		resize: vertical;
	}

	.intervals {
		overflow-y: auto;
	}
	.add-interval {
		min-width: 10rem;
	}
	.duration {
		align-self: end;
		&:not(.sx-badge-red) {
			color: var(--sx-gray-200);
		}
	}
</style>

<PageLayout title={name || 'New Event'}>
	{#if mode === EventsEditMode.Create || $eventFromRoute}
		<form on:submit|preventDefault={submit} class="f-column gap-4">
			<TextInput bind:value={name} id="event-name">Event Name</TextInput>

			<div class="f-column">
				<div class="f-row f-wrap">
					<Fieldset legend="Attendance Type">
						<div class="sx-toggles">
							{#each attendanceTypes as tp}
								{@const inputId = `attendance-type-${tp.value}`}
								<input id={inputId} bind:group={attendanceType} value={tp.value} type="radio" />
								<label for={inputId}>
									{tp.text}
								</label>
							{/each}
						</div>
					</Fieldset>
				</div>
			</div>
			<label>
				Details
				<br />
				<textarea bind:value={notes} placeholder="Details can use markdown" />
			</label>

			<div class="f-row gap-2 intervals mt-2 py-3">
				{#each intervals as interval, index}
					<EventInterval
						bind:interval
						{attendanceType}
						on:delete-interval={() => deleteInterval(index)}
						canDeleteInterval={intervals.length > 1}
					/>
				{/each}

				<button type="button" class="m-0 secondary add-interval" on:click={addInterval}>
					<p><Icon icon="plus" /> Add a time slot</p>
				</button>
			</div>

			<div class="f-column gap-2">
				{#if datesValid}
					<p class="m-0 duration p-1" class:sx-badge-red={eventDuration < 1}>
						{#if !datesValid}
							Invalid times!
						{:else}
							<EventTimes {startDate} {endDate} showDuration />
						{/if}
					</p>
				{/if}
				{#if startDate && endDate && eventDuration < 1}
					<p class="sx-badge-red m-0 py-3">
						Event is too short! ({eventDuration} hours)
					</p>
				{/if}
			</div>

			<div class="f-row justify-content-end align-items-center gap-2">
				{#if mode === EventsEditMode.Edit}
					<Checkbox bind:checked={clearRsvps}>Clear RSVPs</Checkbox>
				{/if}
				{#if mode === EventsEditMode.Edit}
					<Link href={eventPageUrl}>
						<span class="button">
							<Icon icon="chevron-left" />
							Back
						</span>
					</Link>
				{/if}
				<button class="primary" disabled={formInvalid}
					>{mode === EventsEditMode.Create ? 'Create' : 'Update'} Event</button
				>
			</div>
		</form>
	{:else}
		<PageSpinner />
	{/if}
</PageLayout>

<script context="module" lang="ts">
	export enum EventsEditMode {
		Create,
		Edit,
	}
</script>

<script lang="ts">
	import { createAutoExpireToast, Icon, TextInput, Checkbox, Fieldset } from 'sheodox-ui';
	import { eventFromRoute, eventOps } from '../stores/events';
	import PageSpinner from '../PageSpinner.svelte';
	import Link from '../Link.svelte';
	import PageLayout from '../../layouts/PageLayout.svelte';
	import EventInterval from './EventInterval.svelte';
	import { EventIntervalEditable, MaskedEvent } from '../../../shared/types/events';
	import EventTimes from './EventTimes.svelte';
	import { addHours, differenceInHours, startOfHour } from 'date-fns';
	import page from 'page';

	export let mode: EventsEditMode;
	let name: string,
		startDate: Date,
		endDate: Date,
		notes: string,
		attendanceType = 'real',
		clearRsvps = false,
		intervals: EventIntervalEditable[] = [];

	if (mode === EventsEditMode.Create) {
		addInterval();
	}

	$: setEventDurationToIntervalBounds(intervals);

	$: initializeData($eventFromRoute);
	$: eventPageUrl = `/events/${$eventFromRoute?.id}`;

	$: datesValid = startDate && endDate;
	$: eventDuration = !datesValid ? 0 : differenceInHours(endDate, startDate);
	$: formInvalid =
		!name || eventDuration < 1 || intervals.some((int) => differenceInHours(int.endDate, int.startDate) < 1);

	function deleteInterval(index: number) {
		intervals.splice(index, 1);
		intervals = intervals;
	}

	function getIntervalBounds(intervals: EventIntervalEditable[]) {
		const earliestTimestamp = Math.min(...intervals.map((int) => int.startDate?.getTime())),
			latestTimestamp = Math.max(...intervals.map((int) => int.endDate?.getTime()));

		return {
			earliestStart: Number.isNaN(earliestTimestamp) ? new Date() : new Date(earliestTimestamp),
			latestEnd: Number.isNaN(latestTimestamp) ? new Date() : new Date(latestTimestamp),
		};
	}

	function setEventDurationToIntervalBounds(intervals: EventIntervalEditable[]) {
		const { earliestStart, latestEnd } = getIntervalBounds(intervals);
		startDate = new Date(earliestStart);
		endDate = new Date(latestEnd);
	}

	function addInterval() {
		const lastEndDate = intervals.at(-1)?.endDate ?? startOfHour(addHours(new Date(), 1));
		intervals.push({
			name: '',
			notes: '',
			canStayOvernight: false,
			startDate: lastEndDate,
			endDate: addHours(lastEndDate, 3),
		});
		intervals = intervals;
	}

	let dataInitialized = false;

	const attendanceTypes = [
		{ value: 'real', text: 'In Person' },
		{ value: 'virtual', text: 'Virtual' },
	];

	function initializeData(event: MaskedEvent) {
		if (!dataInitialized && event) {
			dataInitialized = true;
			name = event.name;
			notes = event.notes;
			startDate = event.startDate;
			endDate = event.endDate;
			attendanceType = event.attendanceType;
			intervals = event.eventIntervals;
		}
	}

	function validationToast(message: string) {
		createAutoExpireToast({
			variant: 'error',
			title: 'Error',
			message,
		});
	}

	function submit() {
		if (!name) {
			return validationToast('Enter a name!');
		}
		if (!startDate) {
			return validationToast('Enter a start date and time!');
		}
		if (!endDate) {
			return validationToast('Enter an end date and time!');
		}

		const eventData = {
			name,
			notes,
			attendanceType,
			startDate: startDate,
			endDate: endDate,
		};

		if (mode === EventsEditMode.Create) {
			eventOps.createEvent(eventData, intervals);
		} else {
			eventOps.updateEvent($eventFromRoute.id, eventData, intervals, clearRsvps);
			page(eventPageUrl);
		}
	}
</script>
