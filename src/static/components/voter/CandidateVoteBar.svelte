<style>
	.up {
		background: var(--shdx-accent-blue);
	}
	.down {
		background: var(--shdx-accent-red);
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
		<div class="voters f-row">
			<span class="vote-count fw-bold">{votes}</span>
			{#each voters as userId (userId)}
				<UserBubble {userId} mode="minimal" />
			{/each}
		</div>
	</div>
{/if}

<script>
	import UserBubble from '../UserBubble.svelte';
	export let direction;
	export let voters;
	export let raceMaxVotes;

	$: votes = voters.length;
	$: votePercent = (votes / raceMaxVotes) * 100;
</script>
