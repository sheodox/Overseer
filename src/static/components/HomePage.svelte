<style>
	.home {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: 1fr;
	}
	@media (max-width: 1200px) {
		.home {
			width: 100vw;
			display: flex;
			flex-direction: column;
		}
	}
</style>

<div class="home p-4 gap-6">
	{#if booker.events.view && $upcomingEvents.length > 0}
		<div class="app-preview">
			<EventsAppPreview />
		</div>
	{/if}
	{#if booker.voter.view}
		<div class="app-preview">
			<VoterPreview />
		</div>
	{/if}
	{#if booker.echo.view}
		<div class="app-preview">
			<RecentUploads />
		</div>
	{/if}
</div>

<script lang="ts">
	import RecentUploads from './echo/RecentUploads.svelte';
	import VoterPreview from './voter/VoterPreview.svelte';
	import { pageName, booker } from './stores/app';
	import EventsAppPreview from './events/EventsAppPreview.svelte';
	import { upcomingEvents } from './stores/events';

	// clear old page names
	$pageName = '';
</script>
