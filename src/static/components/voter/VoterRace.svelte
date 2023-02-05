<style>
	.show-wizard {
		border: 2px solid var(--sx-pink-400);
		color: var(--sx-pink-400);
	}
</style>

{#if $voterSelectedRace}
	<PageLayout title={$voterSelectedRace?.name}>
		<div slot="beside-title">
			<MenuButton>
				<span slot="trigger">
					Options <Icon icon="chevron-down" />
				</span>
				<ul slot="menu">
					<li>
						<button on:click={() => (showFilters = !showFilters)}>
							<Icon icon="filter" />
							{showFilters ? 'Hide Filters' : 'Show Filters'}
						</button>
					</li>
					<li>
						<button on:click={viewAllDetails}>
							<Icon icon="eye" />
							View All Details
						</button>
					</li>
					{#if $isViewingDetails}
						<li>
							<button on:click={hideAllDetails}>
								<Icon icon="eye-slash" />
								Close All Details
							</button>
						</li>
					{/if}
					{#if booker.voter.reset_votes}
						<li>
							<button on:click={resetVotes}>
								<Icon icon="redo-alt" /> Reset Votes
							</button>
						</li>
					{/if}
					{#if booker.voter.rename_race}
						<li>
							<button on:click={() => (showRaceRename = true)}>
								<Icon icon="edit" /> Rename Race
							</button>
						</li>
					{/if}
					{#if booker.voter.remove_race}
						<li>
							<button on:click={() => (showRaceDelete = true)}>
								<Icon icon="trash" /> Delete Race
							</button>
						</li>
					{/if}
					{#if booker.voter.ban_candidate}
						<li>
							<button on:click={unbanAll}>
								<Icon icon="check" /> Unban All
							</button>
						</li>
					{/if}
				</ul>
			</MenuButton>
		</div>

		{#if showFilters}
			<div class="mb-2"><VoterUserFilters {voters} /></div>
		{/if}
		<div class="f-row justify-content-between align-items-center">
			{#if booker.voter.add_candidate}
				<form on:submit|preventDefault={addCandidate} class="align-self-center mb-2" id="new-candidate-form">
					<div class="align-self-center">
						<TextInput id="new-candidate" bind:value={newCandidateName}>New candidate</TextInput>
					</div>
				</form>
			{/if}
			{#if $isViewingDetails}
				<button class="secondary" on:click={hideAllDetails}>
					<Icon icon="eye-slash" />
					Hide details to re-enable automatic ranking.
				</button>
			{/if}
			{#if booker.voter.vote}
				<button class="show-wizard" on:click={() => (showVoteWizard = true)}>Help Me Vote!</button>
			{/if}
		</div>

		{#if hasFilteredOutVoters}
			<p class="text-align-center">
				Some voters are not being shown in this ranking. <button on:click={() => ($filteredOutVoters = [])}
					>Reset</button
				>
			</p>
		{/if}
		<div class="f-column" on:mouseenter={() => ($sortLocked = true)} on:mouseleave={() => ($sortLocked = false)}>
			{#each $candidates as candidate (candidate.id)}
				<Candidate
					{candidate}
					{raceMaxVotes}
					candidateImages={$voterSelectedRace.candidateImages}
					showDetails={$candidatesViewingDetails.includes(candidate.id)}
					on:details={toggleViewingDetails}
				/>
			{:else}
				<p class="text-align-center"><em>There aren't any candidates yet.</em></p>
			{/each}
		</div>
	</PageLayout>
{:else if $voterInitialized}
	<p>There doesn't seem to be a race with that ID</p>
	<p>
		<Link href="/voter">Go back to Voter.</Link>
	</p>
{:else}
	<PageSpinner />
{/if}

{#if showRaceDelete}
	<Modal bind:visible={showRaceDelete} title="Delete {$voterSelectedRace.name}">
		<p class="modal-body">Are you sure you want to delete this?</p>
		<div class="modal-footer">
			<button on:click={() => (showRaceDelete = false)}>Cancel</button>
			<button on:click={deleteRace} class="danger"><Icon icon="trash" />Delete</button>
		</div>
	</Modal>
{/if}

{#if showRaceRename}
	<PromptModal
		bind:visible={showRaceRename}
		title="Rename {$voterSelectedRace.name}"
		label="New race name"
		on:save={renameRace}
	/>
{/if}

{#if showVoteWizard}
	<VoteWizard bind:visible={showVoteWizard} />
{/if}

<script lang="ts">
	import MenuButton from 'sheodox-ui/MenuButton.svelte';
	import Icon from 'sheodox-ui/Icon.svelte';
	import Modal from 'sheodox-ui/Modal.svelte';
	import TextInput from 'sheodox-ui/TextInput.svelte';
	import { writable, derived } from 'svelte/store';
	import {
		createRankedCandidateStore,
		filteredOutVoters,
		getRaceMaxVotes,
		voterInitialized,
		voterOps,
		voterSelectedRace,
	} from '../stores/voter';
	import { booker } from '../stores/app';
	import PageSpinner from '../PageSpinner.svelte';
	import Candidate from './Candidate.svelte';
	import { activeRouteParams } from '../stores/routing';
	import Link from '../Link.svelte';
	import PromptModal from '../PromptModal.svelte';
	import PageLayout from '../../layouts/PageLayout.svelte';
	import VoteWizard from './VoteWizard.svelte';
	import VoterUserFilters from './VoterUserFilters.svelte';

	// a store of candidate IDs that are expanded
	const candidatesViewingDetails = writable<string[]>([]),
		isViewingDetails = derived(candidatesViewingDetails, (candidates) => {
			return candidates.length;
		});

	function toggleViewingDetails(e: CustomEvent<string>) {
		candidatesViewingDetails.update((viewingCandidates) => {
			return viewingCandidates.includes(e.detail)
				? viewingCandidates.filter((id) => id !== e.detail)
				: [...viewingCandidates, e.detail];
		});
	}

	function viewAllDetails() {
		candidatesViewingDetails.set($candidates.map((candidate) => candidate.id));
	}

	function hideAllDetails() {
		$candidatesViewingDetails = [];
	}

	const sortLocked = writable(false),
		candidates = createRankedCandidateStore(
			voterSelectedRace,
			derived([sortLocked, isViewingDetails], ([locked, viewing]) => {
				return locked || !!viewing;
			})
		);

	let newCandidateName = '',
		showRaceRename = false,
		showRaceDelete = false,
		showVoteWizard = false,
		showFilters = false;

	$: raceId = $activeRouteParams.raceId;
	$: raceMaxVotes = getRaceMaxVotes($candidates);
	$: voters = Array.from(
		$voterSelectedRace.candidates.reduce((votes, candidate) => {
			for (const voter of candidate.votedUp) {
				votes.add(voter);
			}
			for (const voter of candidate.votedDown) {
				votes.add(voter);
			}
			return votes;
		}, new Set<string>())
	);
	$: hasFilteredOutVoters = voters.some((v) => $filteredOutVoters.includes(v));

	function addCandidate() {
		voterOps.candidate.new(raceId, newCandidateName);
		newCandidateName = '';
	}

	function resetVotes() {
		voterOps.race.resetVotes(raceId);
	}

	function renameRace(e: CustomEvent<string>) {
		voterOps.race.rename(raceId, e.detail);
	}

	function deleteRace() {
		showRaceDelete = false;
		voterOps.race.delete(raceId);
	}

	function unbanAll() {
		if (confirm('Are you sure you want to unban all candidates in this race?')) {
			voterOps.race.unbanAll($voterSelectedRace.id);
		}
	}
</script>
