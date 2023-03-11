<style lang="scss">
	.w-100 {
		width: 100%;
	}
	.app-preview {
		width: 60rem;
		max-width: 100%;
		background: var(--sx-gray-transparent);
		padding: var(--sx-spacing-4);
		border-radius: 10px;
	}
	.app-preview :global(.card.clickable) {
		box-shadow: var(--sx-shadow-1);
	}
</style>

<div class="w-100 f-column p-4 gap-6 align-items-center">
	{#if booker.events.view}
		<div class="app-preview wider">
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
