<style>
	h2 {
		margin: 0.5rem;
	}
	.preview {
		width: 35rem;
		max-width: 100%;
		border-radius: 3px;
	}
	ol {
		padding: 0;
		list-style: none;
	}
	.extra-message {
		margin-top: 0;
		color: var(--shdx-gray-75);
	}
</style>

<Link href={raceHref} styles="width: 100%">
	<div class="preview card clickable px-3">
		<div class="f-row justify-content-between align-items-center">
			<h2>
				{race.name}
			</h2>
		</div>
		<div class="panel-body">
			{#if candidateSlice.length}
				<ol>
					{#each candidateSlice as candidate}
						<li>
							<Candidate interactive={false} {candidate} {raceMaxVotes} />
						</li>
					{/each}
				</ol>
			{:else}
				<p class="text-align-center"><em>No candidates!</em></p>
			{/if}
			{#if extraCandidates > 0}
				<p class="text-align-center extra-message">
					And {extraCandidates} other candidate{extraCandidates === 1 ? '' : 's'}!
				</p>
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

	const maxCandidates = 3;
	$: candidateRanking = rankCandidates(race);
	$: candidateSlice = candidateRanking.slice(0, maxCandidates);
	$: extraCandidates = candidateRanking.length - maxCandidates;
	$: raceMaxVotes = getRaceMaxVotes(race);
	$: raceHref = `/voter/${race.id}`;
</script>
