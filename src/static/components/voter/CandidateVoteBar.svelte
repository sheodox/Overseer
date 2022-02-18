<style lang="scss">
	.up,
	.down {
		border: 2px solid transparent;
	}
	.up {
		border-color: var(--shdx-accent-blue);
		background-color: var(--shdx-blue-800);
		&.has-opposing {
			border-right-width: 0;
		}
		&.no-opposing {
			border-radius: 0 3px 3px 0;
		}
	}
	.down {
		border-color: var(--shdx-accent-red);
		background-color: var(--shdx-red-800);
		border-radius: 0 3px 3px 0;

		&.has-opposing {
			border-left-width: 0;
		}
	}
	.voters {
		position: absolute;
		bottom: 0.2rem;
	}
	.vote-count {
		padding: 0 0.2rem;
	}
	.bar {
		transition: width 0.2s;

		&.no-votes {
			border: none;
		}
	}
</style>

<div
	class={`bar f-row ${direction} ${hasOpposingVoters ? 'has-opposing' : 'no-opposing'} ${
		votePercent > 0 ? 'has-votes' : 'no-votes'
	}`}
	style="width: {votePercent}%"
>
	{#if votePercent > 0}
		<div class="voters f-row gap-1">
			<span class="vote-count fw-bold">{votes}</span>
			{#each voters as userId (userId)}
				<UserBubble {userId} mode="minimal" />
			{/each}
		</div>
	{/if}
</div>

<script lang="ts">
	import UserBubble from '../UserBubble.svelte';
	import type { VoteDirection } from '../../../shared/types/voter';

	export let direction: VoteDirection;
	export let voters: string[];
	export let raceMaxVotes: number;
	export let opposingVoters: string[];

	$: votes = voters.length;
	$: votePercent = (votes / raceMaxVotes) * 100;
	$: hasOpposingVoters = opposingVoters.length > 0;
</script>
