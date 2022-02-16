<style lang="scss">
	#vote-wizard {
		background-color: var(--shdx-gray-800);
		position: fixed;
		top: 0;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 100000;
		padding: 1rem;
	}
	#wizard-candidate-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 80rem;
		max-width: 100vw;
		margin: 0 auto;
		padding: 1rem;
		position: absolute;
		top: 50%;
		left: 50%;
		height: 100%;
		transform: translate(-50%, -50%);
	}
	.box {
		background: var(--shdx-gray-600);
		border-radius: 1rem;
		padding: 1rem;
	}
	.up {
		color: var(--shdx-blue-400);
	}
	.down {
		color: var(--shdx-red-400);
	}
	.details {
		overflow-y: auto;
		flex: 6;
		width: 100%;
	}
	.wizard-actions {
		width: 40rem;
		max-width: 100%;
	}
	.up,
	.down {
		&[aria-pressed='true'] {
			border: 2px solid currentColor;
		}
	}
	button {
		font-size: var(--shdx-font-size-5);
		white-space: nowrap;
		margin: 0;
	}
	.f-column,
	.f-row {
		gap: var(--shdx-spacing-2);
	}

	@media (max-width: 500px) {
		button {
			font-size: var(--shdx-font-size-3);
		}
		h1 {
			font-size: var(--shdx-font-size-8) !important;
		}
	}
</style>

<div id="vote-wizard">
	<div id="wizard-candidate-container" class="f-1 gap-5">
		{#if candidate}
			<div class="box details">
				{#key candidate.id}
					<div in:fly={{ y: 50 }}>
						<h1 class="m-0 shdx-font-size-10">{candidate.name}</h1>
						<div class="has-inline-links shdx-font-size-4">{@html candidate.notesRendered}</div>
						<div class="f-row f-wrap">
							<CandidateImages
								{candidate}
								candidateImages={$voterSelectedRace.candidateImages}
								size={AlbumSize.Medium}
							/>
						</div>
					</div>
				{/key}
			</div>
			<div class="box f-column f-1 wizard-actions">
				<div class="f-row f-1">
					<button class="f-1" on:click={prev} disabled={!currentCandidateIndex}>
						<Icon icon="chevron-left" />
						Back
					</button>
					<button class="f-1 down" on:click={down} aria-pressed={candidate.voted === 'down'}>
						<Icon icon="minus" variant="icon-only" />
						<span class="sr-only">Vote down</span>
					</button>
					<button class="up f-1" on:click={up} aria-pressed={candidate.voted === 'up'}>
						<Icon icon="plus" variant="icon-only" />
						<span class="sr-only">Vote up</span>
					</button>
					<button
						class="f-1"
						on:click={next}
						disabled={currentCandidateIndex === $voterSelectedRace.candidates.length - 1}
					>
						Skip
						<Icon icon="chevron-right" variant="append" />
					</button>
				</div>
				<div class="f-1 f-column">
					<div>
						<Progress value={currentCandidateIndex} max={totalCandidates} id="wizard-progress" />
					</div>
					<button class="f-1" on:click={() => (visible = false)}>
						<Icon icon="times" />
						Done
					</button>
				</div>
			</div>
		{:else}
			<p>
				Oh, looks like you're done.
				<br />
				<button on:click={() => (visible = false)}> Get me out of here! </button>
			</p>
		{/if}
	</div>
</div>

<script lang="ts">
	import { fly } from 'svelte/transition';
	import { Icon, Progress } from 'sheodox-ui';
	import { AlbumSize } from '../image/Album.svelte';
	import { voterSelectedRace, voterOps } from '../stores/voter';
	import CandidateImages from './CandidateImages.svelte';
	import { MaskedCandidate } from '../../../shared/types/voter';

	export let visible: boolean;

	const candidates = shuffle($voterSelectedRace.candidates);
	$: candidate = candidates[currentCandidateIndex];
	$: canPrev = currentCandidateIndex > 0;
	$: totalCandidates = $voterSelectedRace.candidates.length - 1;
	$: canNext = currentCandidateIndex < totalCandidates;
	let currentCandidateIndex = 0;

	function shuffle(candidates: MaskedCandidate[]) {
		const unvoted = candidates.filter((c) => !c.voted),
			voted = candidates.filter((c) => !!c.voted);

		// shuffle everything each time the wizard is opened, so people don't get accustomed to the order
		// things were entered in, so they have to pay attention each time. sort the more actionable
		// items first by puting the shuffled array of candidates that the user hasn't voted on before
		// the ones that they have voted on. that way if they close and reopen the wizard they're greeted
		// with the most actionable items right away.
		return [...randomizeArray(unvoted), ...randomizeArray(voted)];
	}

	function randomizeArray<T>(arr: T[]): T[] {
		const randomized: T[] = [];
		// copy so we don't mutate the original array
		arr = [...arr];

		while (arr.length) {
			const i = Math.floor(Math.random() * arr.length);
			randomized.push(arr.splice(i, 1)[0]);
		}
		return randomized;
	}

	function done() {
		visible = false;
	}

	function next() {
		if (canNext) {
			currentCandidateIndex++;
		} else {
			done();
		}
	}

	function prev() {
		if (canPrev) {
			currentCandidateIndex--;
		}
	}

	function up() {
		voterOps.candidate.vote(candidate.id, 'up');
		next();
	}

	function down() {
		voterOps.candidate.vote(candidate.id, 'down');
		next();
	}
</script>
