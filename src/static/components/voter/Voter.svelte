<PageLayout title="Voter">
	<div slot="beside-title">
		{#if booker.voter.add_race}
			<button on:click={() => (showAddRace = true)} class="primary">
				<Icon icon="plus" />
				Add Race
			</button>
		{/if}
	</div>
	{#if !$voterInitialized}
		<PageSpinner />
	{:else}
		<div class="f-row f-wrap justify-content-center gap-3">
			{#each $voterRaces as race}
				<RacePreview {race} />
			{:else}
				<p>There aren't any races yet.</p>
			{/each}
		</div>
	{/if}
</PageLayout>

{#if showAddRace}
	<PromptModal bind:visible={showAddRace} label="Enter the name for a new race" title="Add Race" on:save={addRace} />
{/if}

<script lang="ts">
	import Icon from 'sheodox-ui/Icon.svelte';
	import { voterInitialized, voterOps, voterRaces } from '../stores/voter';
	import { booker } from '../stores/app';
	import PageSpinner from '../PageSpinner.svelte';
	import RacePreview from './RacePreview.svelte';
	import { pageName } from '../stores/app';
	import PromptModal from '../PromptModal.svelte';
	import PageLayout from '../../layouts/PageLayout.svelte';

	let showAddRace = false;
	pageName.set('Voter');

	function addRace(e: CustomEvent<string>) {
		voterOps.race.new(e.detail);
		showAddRace = false;
	}
</script>
