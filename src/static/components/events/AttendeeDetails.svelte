{#if filter === 'day'}
	<div class="f-row f-wrap gap-2">
		{#each event.attendeesByDay as day}
			<Attendees rsvps={day.attendees} showEmpty={true} title="{getDayOfWeekName(day.dayOfWeek)} {day.date}" />
		{/each}
	</div>
{:else if filter === 'overnight'}
	<div class="f-row f-wrap gap-2">
		{#each event.attendeesByDay as day}
			<Attendees
				rsvps={day.attendees.filter((rsvp) => rsvp.stayingOvernight)}
				showEmpty={true}
				title="{getDayOfWeekName(day.dayOfWeek)} {day.date}"
			/>
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
