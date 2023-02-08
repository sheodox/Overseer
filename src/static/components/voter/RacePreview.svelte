<style lang="scss">
	h2 {
		margin: 0.5rem;
	}
	.preview {
		max-width: 100%;
		border-radius: 5px;
		overflow: hidden;
	}
	ol {
		padding: 0;
		margin: 0;
		list-style: none;
	}
	.up {
		background: var(--sx-blue-400);
	}
	.down {
		background: var(--sx-red-400);
	}
	.count {
		font-weight: bold;
		height: var(--sx-spacing-2);
	}
	.bars {
		border-radius: 5px;
		overflow: hidden;
		background: var(--sx-gray-500);
		filter: saturate(0.35);
	}
	.candidate-preview:hover .bars {
		filter: saturate(1);
	}
	.card-title {
		white-space: nowrap;
		text-overflow: ellipsis;
		overflow: hidden;
	}
	.candidate-preview {
		min-width: 10rem;
		overflow: hidden;
	}
</style>

<Link href={raceHref} styles="width: 100%">
	<div class="preview card clickable">
		<div class="card-title">
			<h2 class="m-0">
				{race.name}
			</h2>
		</div>
		<div class="card-body">
			{#if candidateSlice.length}
				<ol class="my-1 f-row gap-2">
					{#each candidateSlice as candidate}
						<li class="card candidate-preview">
							<div class="card-title">{candidate.name}</div>
							<div class="card-body">
								<div class="f-row bars justify-content-between">
									<div class="count up" style:width={100 * (candidate.votedUp.length / raceMaxVotes) + '%'} />
									<div class="count down" style:width={100 * (candidate.votedDown.length / raceMaxVotes) + '%'} />
								</div>
							</div>
						</li>
					{/each}
				</ol>
			{:else}
				<p class="text-align-center"><em>No candidates!</em></p>
			{/if}
		</div>
	</div>
</Link>

<script lang="ts">
	import Link from '../Link.svelte';
	import { getRaceMaxVotes, rankCandidates } from '../stores/voter';
	import Candidate from './Candidate.svelte';
	import type { MaskedRace } from '../../../shared/types/voter';

	export let race: MaskedRace;

	const maxCandidates = 5;
	$: candidateRanking = rankCandidates(race, []);
	$: candidateSlice = candidateRanking.slice(0, maxCandidates);
	$: raceMaxVotes = getRaceMaxVotes(race.candidates);
	$: raceHref = `/voter/${race.id}`;
</script>
