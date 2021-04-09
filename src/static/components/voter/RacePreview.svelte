<style>
    h2 {
        margin: 0.5rem;
    }
    .preview {
        margin: 1rem 1rem 3rem;
        width: 35rem;
        max-width: 95%;
    }
    ol {
        padding: 0;
        list-style: none;
    }
    .extra-message {
        margin-top: 0;
    }
</style>

<div class="preview">
    <div class="f-row justify-content-between align-items-center">
        <h2>{race.name}</h2>
        <Link href={raceHref}>
            <span class="fw-bold">Vote</span>
            <Icon icon="chevron-right" />
        </Link>
    </div>
    <div class="panel-body">
        {#if candidateSlice.length}
            <ol>
                {#each candidateSlice as candidate, index}
                    <li>
                        <Candidate interactive={false} {candidate} {raceMaxVotes} />
                    </li>
                {/each}
            </ol>
        {:else}
            <p class="text-align-center"><em>No candidates!</em></p>
        {/if}
        {#if extraCandidates > 0}
            <Link href={raceHref}>
                <p class="text-align-center extra-message">
                    And {extraCandidates} other candidate{extraCandidates === 1 ? '' : 's'}!
                </p>
            </Link>
        {/if}
    </div>
</div>

<script>
    import {Icon} from 'sheodox-ui';
    import Link from '../Link.svelte';
    import {getRaceMaxVotes, rankCandidates, voterSelectedRace} from "../stores/voter";
    import Candidate from "./Candidate.svelte";

    export let race;

    const maxCandidates = 3;
    $: candidateRanking = rankCandidates(race);
    $: candidateSlice = candidateRanking.slice(0, maxCandidates);
    $: extraCandidates = candidateRanking.length - maxCandidates;
    $: raceMaxVotes = getRaceMaxVotes(race);
    $: raceHref = `/voter/${race.id}`
</script>