<style>
    h2 {
        margin: 0.5rem;
    }
    .panel {
        margin: 1rem;
        width: 35rem;
    }
    ol {
        padding: 0;
        list-style: none;
    }
</style>

<div class="panel bordered">
    <div class="f-row justify-content-between align-items-center">
        <h2>{race.name}</h2>
        <Link href="/voter/{race.id}">
            <span class="fw-bold">Vote</span>
            <Icon icon="chevron-right" />
        </Link>
    </div>
    <div class="panel-body">
        {#if candidateRanking.length}
            <ol>
                {#each candidateRanking as candidate, index}
                    <li>
                        <Candidate interactive={false} {candidate} {raceMaxVotes} />
                    </li>
                {/each}
            </ol>
        {:else}
            <p>No candidates!</p>
        {/if}
    </div>
</div>

<script>
    import {Icon} from 'sheodox-ui';
    import Link from '../Link.svelte';
    import {getRaceMaxVotes, rankCandidates, voterSelectedRace} from "../stores/voter";
    import Candidate from "./Candidate.svelte";

    export let race;

    $: candidateRanking = rankCandidates(race).slice(0, 3);
    $: raceMaxVotes = getRaceMaxVotes(race);
</script>