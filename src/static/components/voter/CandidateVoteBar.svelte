<style>
	.up,
	.down {
		border: 2px solid transparent;
	}
	.up {
		border-color: var(--shdx-accent-blue);
		background-color: var(--shdx-blue-800);
	}
	.down {
		border-color: var(--shdx-accent-red);
		background-color: var(--shdx-red-800);
	}
	.voters {
		position: absolute;
		bottom: 0.2rem;
	}
	.vote-count {
		padding: 0 0.2rem;
	}
</style>

{#if votePercent > 0}
	<div class="f-row {direction}" style="width: {votePercent}%">
		<div class="voters f-row gap-1">
			<span class="vote-count fw-bold">{votes}</span>
			{#each voters as userId (userId)}
				<UserBubble {userId} mode="minimal" />
			{/each}
		</div>
	</div>
{/if}

<script lang="ts">
	import UserBubble from '../UserBubble.svelte';
	import type { VoteDirection } from '../../../shared/types/voter';

	export let direction: VoteDirection;
	export let voters: string[];
	export let raceMaxVotes: number;

	$: votes = voters.length;
	$: votePercent = (votes / raceMaxVotes) * 100;
</script>
