<style>
    .page-content {
        margin: 1rem;
        max-width: 60rem;
    }
    h1 {
        margin: 0;
    }
    #new-candidate-form {
        margin: 1rem;
    }
</style>

{#if $voterSelectedRace}
    <div
        class="page-content f-column"
        on:mouseenter={() => $sortLocked = true}
        on:mouseleave={() => $sortLocked = false}
    >
        <div class="f-row justify-content-between align-items-center">
            <h1>{$voterSelectedRace?.name}</h1>
            {#if hasRaceOptionPermissions}
                <MenuButton>
                <span slot="trigger">
                    Options <Icon icon="chevron-down" />
                </span>
                    <ul slot="menu">
                        {#if window.Booker.voter.reset_votes}
                            <li>
                                <button on:click={resetVotes}>
                                    <Icon icon="redo-alt"/> Reset Votes
                                </button>
                            </li>
                        {/if}
                        {#if window.Booker.voter.rename_race}
                            <li>
                                <button on:click={() => showRaceRename = true}>
                                    <Icon icon="edit" /> Rename Race
                                </button>
                            </li>
                        {/if}
                        {#if window.Booker.voter.remove_race}
                            <li>
                                <button on:click={() => showRaceDelete = true}>
                                    <Icon icon="trash" /> Delete Race
                                </button>
                            </li>
                        {/if}
                    </ul>
                </MenuButton>
            {/if}
        </div>

        {#if window.Booker.voter.add_candidate}
            <form on:submit|preventDefault={addCandidate} class="align-self-center" id="new-candidate-form">
                <div class="input-group align-self-center">
                    <label for="new-candidate">
                        New candidate
                    </label>
                    <input id="new-candidate" placeholder="add something to vote for" bind:value={newCandidateName} />
                </div>
            </form>
        {/if}

        {#each $candidates as candidate (candidate.id)}
            <Candidate {candidate} {raceMaxVotes} candidateImages={$voterSelectedRace.candidateImages}/>
        {/each}
    </div>
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
            <button on:click={() => showRaceDelete = false}>Cancel</button>
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

<script>
    import {MenuButton, Icon, Modal} from 'sheodox-ui';
    import {writable} from 'svelte/store';
    import {
        createRankedCandidateStore,
        getRaceMaxVotes,
        voterInitialized,
        voterOps,
        voterSelectedRace
    } from "../stores/voter";
    import PageSpinner from "../PageSpinner.svelte";
    import Candidate from "./Candidate.svelte";
    import {activeRouteParams} from "../stores/routing";
    import Link from "../Link.svelte";
    import PromptModal from "../PromptModal.svelte";

    const sortLocked = writable(false),
        hasRaceOptionPermissions = ['rename_race', 'remove_race', 'reset_votes'].some(action => window.Booker.voter[action]),
        candidates = createRankedCandidateStore(voterSelectedRace, sortLocked)

    let newCandidateName = '',
        showRaceRename = false,
        showRaceDelete = false;

    $: raceId = $activeRouteParams.raceId
    $: raceMaxVotes = getRaceMaxVotes($voterSelectedRace);

    function addCandidate() {
        voterOps.candidate.new(raceId, newCandidateName);
        newCandidateName = '';
    }

    function resetVotes() {
        voterOps.race.resetVotes(raceId);
    }

    function renameRace(e) {
        voterOps.race.rename(raceId, e.detail);
    }

    function deleteRace() {
        showRaceDelete = false;
        voterOps.race.delete(raceId);
    }

</script>