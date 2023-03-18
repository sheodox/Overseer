<style>
	.notes :global(p) {
		white-space: pre-line;
	}
</style>

<div class="details p-3 mt-2 mb-5">
	<div class="f-row justify-content-between">
		<UserBubble userId={candidate.creatorId}>
			<em>Created {candidate.createdAt.toLocaleDateString()}</em>
		</UserBubble>
		{#if !candidate.deleted && (booker.voter.update_candidate || canDelete)}
			<MenuButton>
				<span slot="trigger">
					Options
					<Icon icon="chevron-down" />
				</span>
				<ul slot="menu">
					{#if booker.voter.update_candidate}
						<li>
							<button on:click={() => (showEdit = true)}>
								<Icon icon="sticky-note" />
								Edit
							</button>
						</li>
					{/if}
					{#if canDelete}
						<li>
							<button on:click={deleteCandidate}>
								<Icon icon="trash" />
								Delete
							</button>
						</li>
					{/if}
					{#if booker.voter.ban_candidate}
						{#if candidate.banned}
							<li>
								<button on:click={unban}>
									<Icon icon="check" />
									Unban
								</button>
							</li>
						{:else}
							<li>
								<button on:click={ban}>
									<Icon icon="ban" />
									Ban
								</button>
							</li>
						{/if}
					{/if}
				</ul>
			</MenuButton>
		{/if}
	</div>

	<div class="notes has-inline-links">
		<!-- notes are markdown rendered HTML -->
		{@html candidate.notesRendered}
	</div>
	<CandidateImages {candidate} {candidateImages} />
</div>

{#if showEdit}
	<EditCandidateModal {candidateImages} {candidate} bind:visible={showEdit} />
{/if}

<script lang="ts">
	import MenuButton from 'sheodox-ui/MenuButton.svelte';
	import Icon from 'sheodox-ui/Icon.svelte';
	import UserBubble from '../UserBubble.svelte';
	import { voterOps } from '../stores/voter';
	import EditCandidateModal from './EditCandidateModal.svelte';
	import CandidateImages from './CandidateImages.svelte';
	import { booker } from '../stores/app';
	import type { MaskedCandidate, CandidateImages as CandidateImagesType } from '../../../shared/types/voter';

	export let candidate: MaskedCandidate;
	export let candidateImages: CandidateImagesType;

	const canDelete = booker.voter.remove_candidate || candidate.created;
	let showEdit = false;

	function deleteCandidate() {
		voterOps.candidate.delete(candidate.id);
	}

	function ban() {
		voterOps.candidate.ban(candidate.id);
	}
	function unban() {
		voterOps.candidate.unban(candidate.id);
	}
</script>
