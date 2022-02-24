<style>
	h2 {
		margin: 0.5rem;
	}
	.preview {
		max-width: 100%;
		border-radius: 5px;
	}
	ol {
		padding: 0;
		list-style: none;
	}
</style>

<Link href={raceHref} styles="width: 100%">
	<div class="preview card clickable px-4">
		<div class="f-row justify-content-between align-items-center">
			<h2 class="m-0 mt-3">
				{race.name}
			</h2>
		</div>
		<div class="panel-body">
			{#if candidateSlice.length}
				<ol class="mt-1 mb-4">
					{#each candidateSlice as candidate}
						<li>
							<Candidate interactive={false} {candidate} {raceMaxVotes} />
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

	const maxCandidates = 3;
	$: candidateRanking = rankCandidates(race, []);
	$: candidateSlice = candidateRanking.slice(0, maxCandidates);
	$: raceMaxVotes = getRaceMaxVotes(race.candidates);
	$: raceHref = `/voter/${race.id}`;
</script>
