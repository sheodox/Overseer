<style>
	.user {
		margin: 0.2rem;
	}
	.no-rsvps {
		color: var(--sx-gray-100);
	}
</style>

{#if rsvps.length || showEmpty}
	<div>
		<h3 class="my-0">{title}</h3>
		{#if rsvps.length}
			<small>{rsvps.length} {rsvps.length === 1 ? 'person' : 'people'}</small>
		{/if}
		<div class="f-row f-wrap">
			{#each rsvps as rsvp}
				<div class="user">
					<UserBubble userId={rsvp.userId} mode="minimal" />
				</div>
			{:else}
				<p class="mt-0 text-align-center no-rsvps"><em>No RSPVs.</em></p>
			{/each}
		</div>
	</div>
{/if}

<script lang="ts">
	import UserBubble from '../UserBubble.svelte';

	export let title = '';
	// this is used by a couple different types (MaskedRSVP and DayAttendee) but only the ID is needed
	export let rsvps: { userId: string }[] = [];
	export let showEmpty = false; //render even if there are no RSVPS to show, will show a "blank" message
</script>
