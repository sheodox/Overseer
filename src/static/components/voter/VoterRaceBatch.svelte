<style>
	.toolbar {
		background: var(--sx-gray-800);
		border-radius: 10px;
	}
	tr {
		height: 3rem;
	}
	tr:nth-of-type(even) {
		background-color: var(--sx-gray-transparent);
	}
</style>

{#if $voterSelectedRace}
	<PageLayout title={$voterSelectedRace.name}>
		<div class="toolbar f-row mb-2">
			{#if booker.voter.ban_candidate}
				<button on:click={unbanSelected}>
					<Icon icon="check" /> Unban
				</button>
				<button on:click={banSelected}>
					<Icon icon="ban" /> Ban
				</button>
			{/if}
		</div>

		<table>
			<thead>
				<tr>
					<th style="width: 2rem">
						<label>
							<input type="checkbox" bind:this={selectAllCheckbox} on:change={onSelectAllChange} />
							<span class="sr-only">Select all</span>
						</label>
					</th>
					<th>Name</th>
					<th>Banned</th>
				</tr>
			</thead>
			<tbody>
				{#each sortAlphabetically($voterSelectedRace.candidates) as candidate}
					<tr>
						<td>
							<label>
								<input type="checkbox" bind:group={selectedIds} value={candidate.id} />
								<span class="sr-only">Select row</span>
							</label>
						</td>

						<td>{candidate.name}</td>
						<td>
							{#if candidate.banned}
								<Icon icon="ban" />
								<span class="sr-only">Yes</span>
							{/if}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</PageLayout>
{/if}

<script lang="ts">
	import { Icon } from 'sheodox-ui';
	import { voterOps, voterSelectedRace } from '../stores/voter';
	import PageLayout from '../../layouts/PageLayout.svelte';
	import { booker } from '../stores/app';
	import { MaskedCandidate } from '../../../shared/types/voter';

	let selectedIds: string[] = [],
		selectAllCheckbox: HTMLInputElement;

	function onSelectAllChange(e: Event) {
		if ((e.target as HTMLInputElement).checked) {
			selectedIds = $voterSelectedRace.candidates.map((c) => c.id);
		} else {
			selectedIds = [];
		}
	}

	$: if (selectAllCheckbox) {
		selectAllCheckbox.checked = selectedIds.length === $voterSelectedRace.candidates.length;
	}

	function unbanSelected() {
		voterOps.candidate.unbanMultiple(selectedIds);
	}
	function banSelected() {
		voterOps.candidate.banMultiple(selectedIds);
	}

	function sortAlphabetically(candidates: MaskedCandidate[]) {
		return [...candidates].sort((a, b) => {
			return a.name.localeCompare(b.name);
		});
	}
</script>
