<style lang="scss">
	.notes {
		white-space: pre-line;
	}
	.interval:not(:last-child) {
		border-bottom: 1px solid var(--sx-gray-transparent);
	}
</style>

<div class="f-column gap-2 mt-2">
	{#each event.eventIntervals as interval}
		<div class="interval p-2">
			<h2 class="my-0">{interval.name}</h2>
			<div class="muted">
				<EventTimes startDate={interval.startDate} endDate={interval.endDate} />
			</div>
			<p class="notes">{interval.notes}</p>
			<Attendance {event} intervalId={interval.id} />
		</div>
	{/each}
</div>

<script lang="ts">
	import EventTimes from './EventTimes.svelte';
	import Attendance from './Attendance.svelte';
	import type { MaskedEvent } from '../../../shared/types/events';

	export let event: MaskedEvent;
</script>
