{#if filter === 'day'}
	<div class="f-row f-wrap gap-6">
		{#each event.attendeesByDay as day}
			<Attendees rsvps={day.attendees} showEmpty={true}>
				{getDayOfWeekName(day.dayOfWeek)}
				{day.date}
			</Attendees>
		{/each}
	</div>
{:else if filter === 'overnight'}
	<div class="f-row f-wrap gap-6">
		{#each event.attendeesByDay as day}
			<Attendees rsvps={day.attendees.filter((rsvp) => rsvp.stayingOvernight)} showEmpty={true}>
				{getDayOfWeekName(day.dayOfWeek)}
				{day.date}
			</Attendees>
		{/each}
	</div>
{/if}

<script lang="ts">
	import { getDayOfWeekName } from '../stores/events';
	import Attendees from './Attendees.svelte';
	import type { MaskedEvent } from '../../../shared/types/events';

	export let event: MaskedEvent;
	export let filter: 'day' | 'overnight';
</script>
