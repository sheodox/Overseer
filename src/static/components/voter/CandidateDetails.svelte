<style>
	.notes :global(p) {
		white-space: pre-line;
	}
	.details {
		margin-bottom: 4rem;
	}
</style>

<div class="details">
	<div class="f-row justify-content-between">
		<UserBubble userId={candidate.creatorId}>
			<em>Created {new Date(candidate.createdAt).toLocaleDateString()}</em>
		</UserBubble>
		{#if !candidate.deleted && (window.Booker.voter.update_candidate || canDelete)}
			<MenuButton>
				<span slot="trigger">
					Options
					<Icon icon="chevron-down" />
				</span>
				<ul slot="menu">
					{#if window.Booker.voter.update_candidate}
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

<script>
	import { MenuButton, Icon } from 'sheodox-ui';
	import UserBubble from '../UserBubble.svelte';
	import { voterOps } from '../stores/voter';
	import EditCandidateModal from './EditCandidateModal.svelte';
	import CandidateImages from './CandidateImages.svelte';

	export let candidate;
	export let candidateImages;

	const canDelete = window.Booker.voter.remove_candidate || candidate.created;
	let showEdit = false;

	function deleteCandidate() {
		voterOps.candidate.delete(candidate.id);
	}
</script>
