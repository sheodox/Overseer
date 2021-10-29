<style>
	.centered {
		text-align: center;
	}
</style>

<div>
	<HomePageAppTitle title="Voter - Preview" href="/voter" />

	{#if races.length}
		<div class="f-column gap-3">
			{#each races as race (race.id)}
				<RacePreview {race} />
			{/each}
			{#if hiddenRaces > 0}
				<p class="text-align-center">
					{#if hiddenRaces === 1}
						And one other race!
					{:else}
						And {hiddenRaces} other races!
					{/if}
				</p>
			{/if}
		</div>
	{:else if $voterInitialized}
		<p class="centered">There aren't any races!</p>
	{:else}
		<div class="centered">
			<SpikeSpinner size="medium" />
		</div>
	{/if}
</div>

<script>
	import { Icon } from 'sheodox-ui';
	import Link from '../Link.svelte';
	import { voterRaces, voterInitialized } from '../stores/voter';
	import SpikeSpinner from '../SpikeSpinner.svelte';
	import RacePreview from './RacePreview.svelte';
	import HomePageAppTitle from '../HomePageAppTitle.svelte';

	const racePreviewMax = 3;

	$: races = $voterRaces.slice(0, racePreviewMax);
	$: hiddenRaces = $voterRaces.length - races.length;
</script>
