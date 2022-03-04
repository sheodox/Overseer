<style>
</style>

{#if mostRelevantEvent !== null}
	<div>
		<HomePageAppTitle title={eventTitle} href="/events" />

		{#if $eventsInitialized}
			{#if mostRelevantEvent}
				<EventPreview event={mostRelevantEvent} />
			{/if}
		{:else}
			<div class="text-align-center">
				<SpikeSpinner size="medium" />
			</div>
		{/if}
	</div>
{/if}

<script lang="ts">
	import { ongoingEvents, upcomingEvents, eventsInitialized, pastEvents } from '../stores/events';
	import EventPreview from './EventPreview.svelte';
	import SpikeSpinner from '../SpikeSpinner.svelte';
	import HomePageAppTitle from '../HomePageAppTitle.svelte';
	import type { EventsData, MaskedEvent } from '../../../shared/types/events';

	let eventTitle = 'Events',
		mostRelevantEvent: MaskedEvent;

	$: findRelevantEvent($ongoingEvents, $upcomingEvents, $pastEvents);

	function findRelevantEvent(ongoing: EventsData, upcoming: EventsData, past: EventsData) {
		if (ongoing.length) {
			mostRelevantEvent = ongoing[0];
			eventTitle = 'Ongoing Event';
		} else if (upcoming.length) {
			mostRelevantEvent = upcoming[0];
			eventTitle = 'Upcoming Event';
		} else if (past.length) {
			mostRelevantEvent = null;
		}
	}
</script>
