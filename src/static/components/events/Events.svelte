<style>
</style>

<PageLayout title="Events">
	<div slot="beside-title">
		{#if booker.events.organize}
			<Link href="/events/create">
				<span class="button primary">
					<Icon icon="plus" />
					Create Event
				</span>
			</Link>
		{/if}
	</div>
	{#if !$eventsInitialized}
		<PageSpinner />
	{:else}
		<EventNotificationReminder />

		{#if $ongoingEvents.length}
			<h2>Ongoing</h2>
			<div class="f-column gap-3">
				{#each $ongoingEvents as event}
					<EventPreview {event} />
				{/each}
			</div>
		{/if}
		{#if $upcomingEvents.length}
			<h2>Upcoming</h2>
			<div class="f-column gap-3">
				{#each $upcomingEvents as event}
					<EventPreview {event} />
				{/each}
			</div>
		{/if}
		{#if $pastEvents.length}
			<h2>Past</h2>
			<div class="f-column gap-3">
				{#each $pastEvents as event}
					<EventPreview {event} />
				{/each}
			</div>
		{/if}

		{#if $events.length === 0}
			<p class="text-align-center">There aren't any events yet.</p>
		{/if}
	{/if}
</PageLayout>

<script lang="ts">
	import Icon from 'sheodox-ui/Icon.svelte';
	import Link from '../Link.svelte';
	import { eventsInitialized, events, ongoingEvents, upcomingEvents, pastEvents } from '../stores/events';
	import EventPreview from './EventPreview.svelte';
	import PageSpinner from '../PageSpinner.svelte';
	import { pageName, booker } from '../stores/app';
	import EventNotificationReminder from './EventNotificationReminder.svelte';
	import PageLayout from '../../layouts/PageLayout.svelte';

	pageName.set('Events');
</script>
