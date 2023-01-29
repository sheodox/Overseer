<style>
	.rsvp-notes {
		max-width: 15rem;
		background: var(--sx-gray-600);
	}
	.notes {
		overflow: auto;
		max-height: 10rem;
	}
</style>

{#if hasNotes}
	<div class="f-row f-wrap gap-3">
		{#each rsvps as rsvp}
			{#if rsvp.notes}
				<div class="rsvp-notes card two-tone">
					<div class="card-title sx-font-size-3">
						<UserBubble userId={rsvp.userId}>
							<span>
								<RSVPStatus status={rsvp.status} />
							</span>
						</UserBubble>
					</div>
					<div class="card-body">
						<p class="notes">{rsvp.notes}</p>
					</div>
				</div>
			{/if}
		{/each}
		{#if !hasNotes}
			<p><em>Nobody left any notes.</em></p>
		{/if}
	</div>
{/if}

<script lang="ts">
	import UserBubble from '../UserBubble.svelte';
	import RSVPStatus from './RSVPStatus.svelte';
	import type { MaskedRsvp } from '../../../shared/types/events';

	export let rsvps: MaskedRsvp[];
	$: hasNotes = rsvps.some(({ notes }) => !!notes);
</script>
