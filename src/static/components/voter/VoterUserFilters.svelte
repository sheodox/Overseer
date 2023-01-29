<Fieldset legend="Ranking Between Users">
	<div class="f-row f-wrap">
		{#each voters as voter}
			<button on:click={() => toggle(voter)} aria-pressed={!$filteredOutVoters.includes(voter)}>
				<UserBubble userId={voter} mode="minimal" />
			</button>
		{:else}
			<p>Nobody has voted yet!</p>
		{/each}
	</div>
</Fieldset>

<script lang="ts">
	import { Fieldset } from 'sheodox-ui';
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
