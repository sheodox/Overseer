<style>
	.user {
		margin: 0.2rem;
	}
</style>

{#if rsvps.length}
	{#each rsvps as rsvp}
		<div class="user">
			<UserBubble userId={rsvp.userId} mode="rsvp" rsvp={rsvp.status} />
		</div>
	{/each}
{/if}

<script lang="ts">
	import { RSVPStatus } from '../../../shared/types/events';
	import UserBubble from '../UserBubble.svelte';

	// this is used by a couple different types (MaskedRSVP and DayAttendee) but only the ID is needed
	export let rsvps: { userId: string; status: RSVPStatus }[] = [];
</script>
