<style>
    .notes {
        white-space: pre-line;
    }
</style>

<div class="f-row justify-content-between">
    <UserBubble user={candidate.creator}>
        <em>Created {new Date(candidate.createdAt).toLocaleDateString()}</em>
    </UserBubble>
    {#if !candidate.deleted}
        <MenuButton>
        <span slot="trigger">
            Options
            <Icon icon="chevron-down" />
        </span>
            <ul slot="menu">
                <li>
                    <button on:click={() => showEdit = true}>
                        <Icon icon="sticky-note" />
                        Edit
                    </button>
                </li>
                {#if window.Booker.voter.remove_candidate || candidate.created}
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

<p class="notes">
    <!-- notes are markdown rendered HTML -->
    {@html candidate.notesRendered}
</p>
<CandidateImages
    {candidate}
    {candidateImages}
/>

{#if showEdit}
    <EditCandidateModal
        {candidateImages}
        {candidate}
        bind:visible={showEdit}
    />
{/if}

<script>
    import {MenuButton, Icon} from 'sheodox-ui';
    import UserBubble from "../UserBubble.svelte";
    import {voterOps} from "../stores/voter";
    import EditCandidateModal from "./EditCandidateModal.svelte";
    import CandidateImages from "./CandidateImages.svelte";

    export let candidate;
    export let candidateImages;

    let showEdit = false;

    function deleteCandidate() {
        voterOps.candidate.delete(candidate.id);
    }
</script>