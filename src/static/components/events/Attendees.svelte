<style>
	.user {
		margin: 0.2rem;
	}
	.no-rsvps {
		color: var(--sx-gray-100);
	}
</style>

{#if rsvps.length || showEmpty}
	<Fieldset legend={title}>
		{#if rsvps.length}
			<small>{rsvps.length} {rsvps.length === 1 ? 'person' : 'people'}</small>
		{/if}
		<div>
			{#each rsvps as rsvp}
				<div class="user">
					<UserBubble userId={rsvp.userId} />
				</div>
			{:else}
				<p class="text-align-center no-rsvps"><em>No RSPVs.</em></p>
			{/each}
		</div>
	</Fieldset>
{/if}

<script lang="ts">
	import { Fieldset } from 'sheodox-ui';
	import UserBubble from '../UserBubble.svelte';

	export let title = '';
	// this is used by a couple different types (MaskedRSVP and DayAttendee) but only the ID is needed
	export let rsvps: { userId: string }[] = [];
	export let showEmpty = false; //render even if there are no RSVPS to show, will show a "blank" message
</script>
