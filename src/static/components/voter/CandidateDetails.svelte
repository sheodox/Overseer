<style>
    .notes {
        white-space: pre-line;
    }
</style>

<div class="f-row justify-content-between">
    <UserBubble user={candidate.creator}>
        <em>Created {new Date(candidate.createdAt).toLocaleDateString()}</em>
    </UserBubble>
    <MenuButton>
        <span slot="trigger">
            Options
            <Icon icon="chevron-down" />
        </span>
        <ul slot="menu">
            <li>
                <button on:click={() => showCandidateRename = true}>
                    <Icon icon="edit" />
                    Rename
                </button>
            </li>
            <li>
                <button on:click={() => showNotesEdit = true}>
                    <Icon icon="sticky-note" />
                    Edit Notes
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
</div>

<p class="notes">
    <!-- notes are markdown rendered HTML -->
    {@html candidate.notesRendered}
</p>

{#if showCandidateRename}
    <PromptModal
        bind:visible={showCandidateRename}
        title="Rename {candidate.name}"
        label="New name"
        on:save={renameCandidate}
    />
{/if}

{#if showNotesEdit}
    <PromptModal
        bind:visible={showNotesEdit}
        initialValue={candidate.notes}
        title="Edit {candidate.name} Notes"
        hint="You can use markdown!"
        label="Notes"
        type="textarea"
        on:save={updateNotes}
    />
{/if}

<script>
    import {MenuButton, Icon} from 'sheodox-ui';
    import UserBubble from "../UserBubble.svelte";
    import {voterOps} from "../stores/voter";
    import PromptModal from "../PromptModal.svelte";

    export let candidate;

    let showCandidateRename = false,
        showNotesEdit = false;

    function deleteCandidate() {
        voterOps.candidate.delete(candidate.id);
    }

    function renameCandidate(e) {
        voterOps.candidate.rename(candidate.id, e.detail)
    }

    function updateNotes(e) {
        voterOps.candidate.updateNotes(candidate.id, e.detail);
    }
</script>