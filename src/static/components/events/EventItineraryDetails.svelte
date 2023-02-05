<style>
	.notes {
		white-space: pre-line;
	}
</style>

<div class="f-column gap-4">
	{#each event.eventIntervals as interval}
		<Fieldset legend={interval.name}>
			<div class="muted">
				<EventTimes startDate={interval.startDate} endDate={interval.endDate} />
			</div>
			<p class="notes">{interval.notes}</p>
			<Attendance {event} intervalId={interval.id} variant="minimal" />
		</Fieldset>
	{/each}
</div>

<script lang="ts">
	import { Fieldset } from 'sheodox-ui';
	import EventTimes from './EventTimes.svelte';
	import Attendance from './Attendance.svelte';
	import type { MaskedEvent } from '../../../shared/types/events';

	export let event: MaskedEvent;
</script>
