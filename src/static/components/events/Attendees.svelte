<style>
	.attendee-list {
		max-width: 15rem;
	}
	.user {
		margin: 0.2rem;
	}
	h3 {
		margin: 0;
	}
</style>

{#if rsvps.length || showEmpty}
	<div class="attendee-list sub-panel m-0 p-0">
		<h3>{title}<slot /></h3>
		{#if rsvps.length}
			<small>{rsvps.length} {rsvps.length === 1 ? 'person' : 'people'}</small>
		{/if}
		<div>
			{#each rsvps as rsvp}
				<div class="user">
					<UserBubble userId={rsvp.userId} />
				</div>
			{:else}
				<p class="text-align-center muted"><em>No RSPVs.</em></p>
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
