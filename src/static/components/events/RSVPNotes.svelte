<style>
	.rsvp-notes {
		max-width: 15rem;
		background: var(--shdx-gray-600);
	}
	.notes {
		overflow: auto;
		max-height: 10rem;
	}
</style>

{#if hasNotes}
	<div>
		<h2 class="pt-3 pl-3 pb-1 m-0">Notes for the organizer</h2>
		<div class="f-row f-wrap">
			{#each rsvps as rsvp}
				{#if rsvp.notes}
					<div class="rsvp-notes m-3 p-3">
						<div>
							<UserBubble userId={rsvp.userId}>
								<span>
									<RSVPStatus status={rsvp.status} />
								</span>
							</UserBubble>
						</div>
						<p class="notes">{rsvp.notes}</p>
					</div>
				{/if}
			{/each}
			{#if !hasNotes}
				<p><em>Nobody left any notes.</em></p>
			{/if}
		</div>
	</div>
{/if}

<script lang="ts">
	import UserBubble from '../UserBubble.svelte';
	import RSVPStatus from './RSVPStatus.svelte';
	import type { MaskedRsvp } from '../../../shared/types/events';

	export let rsvps: MaskedRsvp[];
	$: hasNotes = rsvps.some(({ notes }) => !!notes);
</script>
