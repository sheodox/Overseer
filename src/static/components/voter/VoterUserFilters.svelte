<style>
	fieldset {
		border-radius: 5px;
		border-color: var(--sx-gray-300);
	}
</style>

<fieldset>
	<legend class="mb-0 fw-bold">Ranking Between Users</legend>
	<div class="f-row f-wrap">
		{#each voters as voter}
			<button on:click={() => toggle(voter)} aria-pressed={!$filteredOutVoters.includes(voter)}>
				<UserBubble userId={voter} mode="minimal" />
			</button>
		{:else}
			<p>Nobody has voted yet!</p>
		{/each}
	</div>
</fieldset>

<script lang="ts">
	import UserBubble from '../UserBubble.svelte';
	import { filteredOutVoters } from '../stores/voter';
	export let voters: string[];

	function toggle(userId: string) {
		if ($filteredOutVoters.includes(userId)) {
			$filteredOutVoters = $filteredOutVoters.filter((u) => u !== userId);
		} else {
			$filteredOutVoters = [...$filteredOutVoters, userId];
		}
	}
</script>
