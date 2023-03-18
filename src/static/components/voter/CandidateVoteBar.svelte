<style lang="scss">
	$bar-radius: 8px;

	.up,
	.down {
		border: 1px solid transparent;
		&.no-opposing {
			border-radius: #{$bar-radius};
		}
	}
	.up {
		border-color: var(--sx-accent-blue);
		background-color: var(--sx-blue-800);
		border-radius: #{$bar-radius} 0 0 #{$bar-radius};

		&.has-opposing {
			border-right-width: 0;
		}
	}
	.down {
		border-color: var(--sx-accent-red);
		background-color: var(--sx-red-800);
		border-radius: 0 #{$bar-radius} #{$bar-radius} 0;

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
		/* don't let user bubbles overflow */
		position: relative;
		overflow: hidden;

		&.no-votes {
			border: none;
		}
	}
</style>

<div
	class={`bar f-row ${direction} ${hasOpposingVoters ? 'has-opposing' : 'no-opposing'} ${
		votePercent > 0 ? 'has-votes pl-1' : 'no-votes'
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
