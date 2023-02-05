<style>
	p::first-letter {
		text-transform: capitalize;
	}
</style>

<p class="m-0">
	{eventTimeString}.
	{#if showDuration}
		Duration: {eventDuration} hour{eventDuration === 1 ? '' : 's'}.
	{/if}
</p>

<script lang="ts">
	import { onDestroy } from 'svelte';
	import { differenceInCalendarDays, differenceInHours } from 'date-fns';

	const timeFormat = new Intl.DateTimeFormat('en-US', { timeStyle: 'short' });

	export let startDate: Date;
	export let endDate: Date;
	export let showDuration = false;
	let eventTimeString = eventTime();

	$: datesValid = startDate && endDate;
	$: eventDuration = !datesValid ? 0 : differenceInHours(endDate, startDate);

	const interval = setInterval(() => {
		eventTimeString = eventTime();
	}, 100);

	onDestroy(() => {
		clearInterval(interval);
	});

	function eventTime() {
		const start = startDate,
			end = endDate,
			numDays = differenceInCalendarDays(start, end);

		if (numDays === 1) {
			return `${dateString(start)} from ${prettyTime(start)} to ${prettyTime(end)}`;
		} else {
			return `${prettyDate(start)} to ${prettyDate(end)}`;
		}
	}

	function dateString(date: Date) {
		if (isDateToday(date)) {
			return 'today';
		}
		return `${getMonth(date)} ${date.getDate()}` + (isDateThisYear(date) ? '' : `, ${date.getFullYear()}`);
	}

	function getMonth(date: Date) {
		return [
			'January',
			'February',
			'March',
			'April',
			'May',
			'June',
			'July',
			'August',
			'September',
			'October',
			'November',
			'December',
		][date.getMonth()];
	}

	function isDateThisYear(date: Date) {
		return new Date().getFullYear() === date.getFullYear();
	}

	function isDateToday(date: Date) {
		return date.toLocaleDateString() === new Date().toLocaleDateString();
	}

	function prettyDate(date: Date) {
		return `${dateString(date)}, ${prettyTime(date)}`;
	}

	function prettyTime(date: Date) {
		//if the time is an exact hour just get rid of the minutes from the string
		return timeFormat.format(date).replace(':00', '');
	}
</script>
