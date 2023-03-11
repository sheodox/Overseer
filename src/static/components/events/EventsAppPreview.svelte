<style>
	.preview {
		display: flex;
		flex-direction: column;
		flex: 1;
	}
	.divider {
		border-right: 1px solid var(--sx-gray-transparent-dark);
	}
</style>

<div class="f-row f-wrap justify-content-between gap-6">
	{#if $eventsInitialized}
		{#if !upcomingEvent && !ongoingEvent}
			<div class="preview">
				<HomePageAppTitle title="Upcoming Event" href="/events" />
				<EventPreview event={null} />
			</div>
		{/if}
		{#if upcomingEvent}
			<div class="preview">
				<HomePageAppTitle title="Upcoming Event" href="/events" />
				<EventPreview event={upcomingEvent} />
			</div>
		{/if}
		{#if ongoingEvent}
			<div class="preview">
				<HomePageAppTitle title="Ongoing Event" href="/events" />
				<EventPreview event={ongoingEvent} />
			</div>
		{/if}

		<div class="divider" />

		{#if pastEvent && (!upcomingEvent || !ongoingEvent)}
			<div class="preview">
				<HomePageAppTitle title="Past Event" href="/events" />
				<EventPreview event={pastEvent} />
			</div>
		{/if}
	{:else}
		<div class="text-align-center">
			<SpikeSpinner size="medium" />
		</div>
	{/if}
</div>

<script lang="ts">
	import { ongoingEvents, upcomingEvents, eventsInitialized, pastEvents } from '../stores/events';
	import EventPreview from './EventPreview.svelte';
	import SpikeSpinner from '../SpikeSpinner.svelte';
	import HomePageAppTitle from '../HomePageAppTitle.svelte';
	import type { EventsData, MaskedEvent } from '../../../shared/types/events';

	let upcomingEvent: MaskedEvent, ongoingEvent: MaskedEvent, pastEvent: MaskedEvent;

	$: findRelevantEvent($ongoingEvents, $upcomingEvents, $pastEvents);

	function findRelevantEvent(ongoing: EventsData, upcoming: EventsData, past: EventsData) {
		if (ongoing.length) {
			ongoingEvent = ongoing[0];
		}
		if (upcoming.length) {
			upcomingEvent = upcoming[0];
		}
		if (past.length) {
			pastEvent = past[0];
		}
	}
</script>
