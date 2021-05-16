<style>
    .candidate-container {
        margin-bottom: 0.5rem;
    }
    .candidate {
        height: 3rem;
    }
    .vote-button {
        width: 2.5rem;
        opacity: 0.5;
        transition: opacity 0.2s;
        border: none;
    }
    .vote-button:hover, .vote-button.voted {
        opacity: 1;
    }
    .vote-button.voted :global(i) {
        filter: drop-shadow(0 0 0.5rem);
    }
    .upvote {
        color: var(--shdx-blue-400);
    }
    .downvote {
        color: var(--shdx-red-400);
    }
    .candidate-name {
        padding: 0.2rem;
        z-index: 1;
    }
    .candidate-name-container {
        position: relative;
        background: var(--shdx-gray-600);
        border-radius: 3px;
        overflow: hidden;
    }
    .vote-bars {
        display: flex;
    }
    .vote-bars {
        width: 100%;
        height: 100%;
        position: absolute;
    }
    .deleted {
        filter: grayscale(1);
    }
</style>

<div class="candidate-container">
    <div class="candidate f-row" class:deleted={candidate.deleted}>
        {#if interactive && window.Booker.voter.vote}
            <button
                on:click={voteUp}
                class="vote-button upvote"
                class:voted={votedUp}
                aria-pressed={votedUp}
                disabled={candidate.deleted}
            >
                <Icon icon={votedUp ? 'plus-circle' : 'plus'} noPadding={true} />
                <span class="sr-only">Vote up</span>
            </button>
            <button
                on:click={voteDown}
                class="vote-button downvote"
                class:voted={votedDown}
                aria-pressed={votedDown}
                disabled={candidate.deleted}
            >
                <Icon icon={votedDown ? 'minus-circle' : 'minus'} noPadding={true} />
                <span class="sr-only">Vote down</span>
            </button>
        {/if}
        <div class="candidate-name-container f-column f-1">
            <span class="fw-bold candidate-name">{candidate.name}</span>
            <div class="vote-bars">
                <CandidateVoteBar direction="up" {raceMaxVotes} voters={candidate.votedUp} candidateDeleted={candidate.deleted} />
                <CandidateVoteBar direction="down" {raceMaxVotes} voters={candidate.votedDown} candidateDeleted={candidate.deleted} />
            </div>
        </div>
        {#if interactive}
            <button on:click={toggleDetails} aria-expanded={showDetails}>
                <Icon icon="chevron-{showDetails ? 'up' : 'down'}" />
                <span class="sr-only">Toggle Showing Details</span>
            </button>
        {/if}
    </div>
    {#if showDetails}
        <CandidateDetails {candidate} {candidateImages} />
    {/if}
</div>

<script>
    import {createEventDispatcher} from 'svelte';
    import {Icon} from 'sheodox-ui';
    import {voterOps} from "../stores/voter";
    import CandidateVoteBar from "./CandidateVoteBar.svelte";
    import CandidateDetails from "./CandidateDetails.svelte";
    const dispatch = createEventDispatcher();

    function toggleDetails() {
        dispatch('details', candidate.id);
    }

    export let candidate;
    export let candidateImages;
    //if you can vote with this, we don't want that to happen on the the race dashboard
    export let interactive = true;
    export let raceMaxVotes;
    export let showDetails;

    $: votedUp = candidate.voted === 'up'
    $: votedDown = candidate.voted === 'down'

    function voteUp() {
        voterOps.candidate.vote(candidate.id, votedUp ? null : 'up');
    }

    function voteDown() {
        voterOps.candidate.vote(candidate.id, votedDown ? null : 'down');
    }
</script>