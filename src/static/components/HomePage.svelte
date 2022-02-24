<style>
	.home {
		width: 100%;
	}
	.app-preview {
		width: 30rem;
		max-width: 100%;
	}
</style>

<div class="home f-column p-4 gap-6 align-items-center">
	{#if booker.events.view && $upcomingEvents.length > 0}
		<div class="app-preview">
			<EventsAppPreview />
		</div>
	{/if}
	<div class="f-row f-wrap gap-6 justify-content-center">
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
