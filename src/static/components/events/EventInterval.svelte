<style lang="scss">
	textarea {
		min-height: 8rem;
	}
	.duration {
		align-self: end;
		&:not(.sx-badge-red) {
			color: var(--sx-gray-200);
		}
	}
</style>

<div class="card p-2 f-column gap-1">
	<TextInput bind:value={interval.name}>Name</TextInput>
	{#if !validName(interval.name)}
		<small class="sx-badge-red"> Invalid name! </small>
	{/if}
	{#if attendanceType === 'real'}
		<Checkbox bind:checked={interval.canStayOvernight}>Can stay overnight</Checkbox>
	{/if}

	<DateTimeInput bind:date={interval.startDate} label="Start time" />
	<DateTimeInput bind:date={interval.endDate} label="End time" />
	<div class="f-row justify-content-center">
		{#each dateUtilityButtons as util}
			<button type="button" class="small secondary" on:click={util.handler} title={util.text}
				><Icon icon={util.icon} variant="icon-only" /><span class="sr-only">{util.text}</span></button
			>
		{/each}
	</div>
	<p class="m-0 duration p-1" class:sx-badge-red={durationInvalid}>
		{#if !interval.endDate || !interval.startDate}
			Invalid times!
		{:else}
			Duration: {duration} hour{duration === 1 ? '' : 's'}
		{/if}
	</p>
	<label class="f-column">
		Notes
		<br />
		<textarea bind:value={interval.notes} class="f-1" />
	</label>
	<button type="button" class="danger" on:click={() => dispatch('delete-interval')} disabled={!canDeleteInterval}>
		Delete Interval
	</button>
</div>

<script lang="ts">
	import { TextInput, Checkbox, Icon } from 'sheodox-ui';
	import DateTimeInput from './DateTimeInput.svelte';
	import { addHours, differenceInHours } from 'date-fns';
	import type { EventIntervalEditable } from '../../../shared/types/events';
	import { name as validName } from '../../../shared/validator';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher<{ 'delete-interval': void }>();

	export let attendanceType: string;
	export let canDeleteInterval: boolean;
	export let interval: EventIntervalEditable;

	$: duration = differenceInHours(interval.endDate, interval.startDate);
	$: datesValid = interval.endDate && interval.startDate;
	$: durationInvalid = duration < 1 || !datesValid;

	const dateUtilityButtons = [
		{ handler: shiftEarlier, text: 'Shift one hour earlier', icon: 'angles-left' },
		{ handler: shiftLater, text: 'Shift one hour later', icon: 'angles-right' },
		{ handler: narrow, text: 'One hour shorter', icon: 'minus' },
		{ handler: widen, text: 'One hour longer', icon: 'plus' },
	];

	function shiftLater() {
		if (datesValid) {
			interval.startDate = addHours(interval.startDate, 1);
			interval.endDate = addHours(interval.endDate, 1);
		}
	}
	function shiftEarlier() {
		if (datesValid) {
			interval.startDate = addHours(interval.startDate, -1);
			interval.endDate = addHours(interval.endDate, -1);
		}
	}

	function widen() {
		if (datesValid) {
			interval.endDate = addHours(interval.endDate, 1);
		}
	}
	function narrow() {
		if (datesValid) {
			interval.endDate = addHours(interval.endDate, -1);
		}
	}
</script>
