<style lang="scss">
	.candidate-container {
		margin-bottom: 0.5rem;
	}
	.candidate {
		height: 3rem;
	}
	.vote-button {
		width: 2.5rem;
		opacity: 0.5;
		transition: opacity 0.2s;
		border: none;
	}
	.vote-button:hover,
	.vote-button.voted {
		opacity: 1;
	}
	.vote-button.voted :global(i) {
		filter: drop-shadow(0 0 0.5rem);
	}
	.upvote:enabled {
		color: var(--sx-blue-400);
	}
	.downvote:enabled {
		color: var(--sx-red-400);
	}
	.candidate-name {
		padding: 0.2rem;
		z-index: 1;
	}
	.candidate-name-container {
		position: relative;
		background: var(--sx-gray-600);
		overflow: hidden;
	}
	.vote-bars {
		display: flex;
	}
	.vote-bars {
		width: 100%;
		height: 100%;
		position: absolute;
	}
	.deleted {
		filter: grayscale(1);
	}
	.banned-message {
		font-style: italic;
	}
</style>

<div class="candidate-container">
	<div class="candidate f-row" class:deleted={candidate.deleted}>
		{#if interactive && booker.voter.vote}
			<button
				on:click={voteUp}
				class="vote-button upvote"
				class:voted={votedUp}
				aria-pressed={votedUp}
				disabled={candidate.deleted || candidate.banned}
				use:ripple
			>
				<Icon icon={votedUp ? 'plus-circle' : 'plus'} variant="icon-only" />
				<span class="sr-only">Vote up</span>
			</button>
			<button
				on:click={voteDown}
				class="vote-button downvote"
				class:voted={votedDown}
				aria-pressed={votedDown}
				disabled={candidate.deleted || candidate.banned}
				use:ripple
			>
				<Icon icon={votedDown ? 'minus-circle' : 'minus'} variant="icon-only" />
				<span class="sr-only">Vote down</span>
			</button>
		{/if}
		<div class="candidate-name-container f-column f-1">
			<span class="fw-bold candidate-name pl-2">{candidate.name}</span>
			{#if candidate.banned}
				<p class="m-0 muted banned-message pl-2">This cannot be voted for currently.</p>
			{:else}
				<div class="vote-bars">
					<CandidateVoteBar
						direction="up"
						{raceMaxVotes}
						voters={candidate.votedUp}
						opposingVoters={candidate.votedDown}
					/>
					<CandidateVoteBar
						direction="down"
						{raceMaxVotes}
						voters={candidate.votedDown}
						opposingVoters={candidate.votedUp}
					/>
				</div>
			{/if}
		</div>
		{#if interactive}
			<button on:click={() => (showDetails = true)} aria-expanded={showDetails}>
				<Icon icon="info-circle" variant="icon-only" />
				<span class="sr-only">Show Details</span>
			</button>
		{/if}
	</div>
	{#if showDetails}
		<Modal bind:visible={showDetails} title={candidate.name} width="1000px">
			<CandidateDetails {candidate} {candidateImages} />
		</Modal>
	{/if}
</div>

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Icon, Modal, ripple } from 'sheodox-ui';
	import { voterOps } from '../stores/voter';
	import CandidateVoteBar from './CandidateVoteBar.svelte';
	import CandidateDetails from './CandidateDetails.svelte';
	import { booker } from '../stores/app';
	import { MaskedCandidate, CandidateImages } from '../../../shared/types/voter';
	const dispatch = createEventDispatcher();

	export let candidate: MaskedCandidate;
	export let candidateImages: CandidateImages = [];
	//if you can vote with this, we don't want that to happen on the the race dashboard
	export let interactive = true;
	export let raceMaxVotes: number;

	let showDetails = false;

	$: votedUp = candidate.voted === 'up';
	$: votedDown = candidate.voted === 'down';

	function voteUp() {
		voterOps.candidate.vote(candidate.id, votedUp ? null : 'up');
	}

	function voteDown() {
		voterOps.candidate.vote(candidate.id, votedDown ? null : 'down');
	}
</script>
