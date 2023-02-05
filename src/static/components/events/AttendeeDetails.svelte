<div class="f-row f-wrap gap-2">
	{#each stayingOvernightByInterval as item}
		<Attendees rsvps={item.rsvps} showEmpty={true} title={item.interval.name} variant="minimal" />
	{/each}
</div>

<script lang="ts">
	import Attendees from './Attendees.svelte';
	import type { MaskedEvent } from '../../../shared/types/events';

	export let event: MaskedEvent;

	$: rsvpsByInterval = event.eventIntervals.map((interval) => {
		return {
			interval,
			rsvps: event.eventIntervalRsvps.filter((r) => r.eventIntervalId === interval.id),
		};
	});
	$: stayingOvernightByInterval = rsvpsByInterval
		.filter(({ interval }) => interval.canStayOvernight)
		.map(({ interval, rsvps }) => {
			return { interval, rsvps: rsvps.filter((r) => r.stayingOvernight) };
		});
</script>
