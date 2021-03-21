<style>
    .candidate {
        margin-bottom: 0.5rem;
        height: 3rem;
    }
    .vote-button {
        width: 2.5rem;
        opacity: 0.5;
        transition: opacity 0.2s;
    }
    .vote-button:hover, .vote-button.voted {
        opacity: 1;
    }
    .vote-button.voted :global(i) {
        filter: drop-shadow(0 0 0.5rem);
    }
    .downvote {
        color: var(--accent-red);
    }
    .candidate-name {
        padding: 0.2rem;
        z-index: 1;
    }
    .candidate-name-container {
        position: relative;
        background: var(--sub-panel-bg);
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
</style>

<div class="candidate f-row" style="--vote-up-percent: {voteUpPercent}%; --vote-down-percent: {voteDownPercent}%">
    {#if interactive}
        <button on:click={voteUp} class="vote-button upvote" class:voted={votedUp} aria-pressed={votedUp}>
            <Icon icon={votedUp ? 'plus-circle' : 'plus'} noPadding={true} />
            <span class="sr-only">Vote up</span>
        </button>
        <button on:click={voteDown} class="vote-button downvote" class:voted={votedDown} aria-pressed={votedDown}>
            <Icon icon={votedDown ? 'minus-circle' : 'minus'} noPadding={true} />
            <span class="sr-only">Vote down</span>
        </button>
    {/if}
    <div class="candidate-name-container f-column f-1">
        <span class="fw-bold candidate-name">{candidate.name}</span>
        <div class="vote-bars">
            <CandidateVoteBar direction="up" votePercent={voteUpPercent} voters={candidate.votedUp} />
            <CandidateVoteBar direction="down" votePercent={voteDownPercent} voters={candidate.votedDown} />
        </div>
    </div>
    {#if interactive}
        <button on:click={() => showDetails = !showDetails}>
            <Icon icon="chevron-{showDetails ? 'up' : 'down'}" />
            <span class="sr-only">Toggle Showing Details</span>
        </button>
    {/if}
</div>
{#if showDetails}
    <CandidateDetails {candidate} />
{/if}

<script>
    import {Icon} from 'sheodox-ui';
    import {voterOps} from "../stores/voter";
    import CandidateVoteBar from "./CandidateVoteBar.svelte";
    import CandidateDetails from "./CandidateDetails.svelte";

    export let candidate;
    //if you can vote with this, we don't want that to happen on the the race dashboard
    export let interactive = true;
    export let raceMaxVotes = 1;
    let showDetails = false;

    $: voteUpPercent = (candidate.votedUp.length / raceMaxVotes) * 100;
    $: voteDownPercent = (candidate.votedDown.length / raceMaxVotes) * 100;
    $: votedUp = candidate.voted === 'up'
    $: votedDown = candidate.voted === 'down'

    function voteUp() {
        voterOps.candidate.vote(candidate.id, votedUp ? null : 'up');
    }

    function voteDown() {
        voterOps.candidate.vote(candidate.id, votedDown ? null : 'down');
    }
</script>