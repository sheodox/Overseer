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
    .detail-hide-prompt {
        position: fixed;
        top: 0.5rem;
        z-index: 99; /* below the theater */
        background: var(--panel-bg);
    }
    input {
        font-size: 0.9rem;
    }
</style>

{#if $voterSelectedRace}
    {#if $isViewingDetails}
        <button class="detail-hide-prompt" on:click={hideAllDetails}>
            <Icon icon="eye-slash" />
            Hide details to re-enable automatic ranking.
        </button>
    {/if}

    <div
        class="page-content f-column"
        on:mouseenter={() => $sortLocked = true}
        on:mouseleave={() => $sortLocked = false}
    >
        <div class="f-row justify-content-between align-items-center">
            <h1>{$voterSelectedRace?.name}</h1>
            <MenuButton>
                <span slot="trigger">
                    Options <Icon icon="chevron-down" />
                </span>
                    <ul slot="menu">
                        <li>
                            <button on:click={viewAllDetails}>
                                <Icon icon="eye" />
                                View All Details
                            </button>
                        </li>
                        {#if $isViewingDetails}
                            <li>
                                <button on:click={hideAllDetails}>
                                    <Icon icon="eye-slash" />
                                    Close All Details
                                </button>
                            </li>
                        {/if}
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
            <Candidate
                {candidate}
                {raceMaxVotes}
                candidateImages={$voterSelectedRace.candidateImages}
                showDetails={$candidatesViewingDetails.includes(candidate.id)}
                on:details={toggleViewingDetails}
            />
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
    import {writable, derived} from 'svelte/store';
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

    const candidatesViewingDetails = writable([]),
        isViewingDetails = derived(candidatesViewingDetails, candidates => {
            return candidates.length;
        });

    function toggleViewingDetails(e) {
        candidatesViewingDetails.update(viewingCandidates => {
            return viewingCandidates.includes(e.detail)
                ? viewingCandidates.filter(id => id !== e.detail)
                : [...viewingCandidates, e.detail];
        })
    }

    function viewAllDetails() {
        candidatesViewingDetails.set($candidates.map(candidate => candidate.id));
    }

    function hideAllDetails() {
        $candidatesViewingDetails = []
    }

    const sortLocked = writable(false),
        candidates = createRankedCandidateStore(voterSelectedRace, derived([sortLocked, isViewingDetails], ([locked, viewing]) => {
            return locked || viewing;
        }));

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