<style>
    h1 {
        font-size: 1.1rem;
        margin: 0 1rem 0 0;
    }
    .centered {
        text-align: center;
    }
    ul {
        list-style: none;
        padding: 0;
    }
</style>

<div class="panel bordered panel-body">
    <div class="f-row justify-content-between align-items-center">
        <h1>Voter - Preview</h1>
        <Link href="/voter">
            <span class="fw-bold">
                Check out Voter
                <Icon icon="chevron-right" />
            </span>
        </Link>
    </div>

    {#if races.length}
        <ul>
            {#each races as race (race.id)}
                <RacePreview {race} />
            {/each}
            {#if hiddenRaces > 0}
                <p class="text-align-center">
                    {#if hiddenRaces === 1}
                        And one other race!
                    {:else}
                        And {hiddenRaces} other races!
                    {/if}
                </p>
            {/if}
        </ul>
    {:else if $voterInitialized}
        <p class="centered">There aren't any races!</p>
    {:else}
        <div class="centered">
            <SpikeSpinner size="medium"/>
        </div>
    {/if}
</div>


<script>
    import {Icon} from 'sheodox-ui';
    import Link from '../Link.svelte';
    import {voterRaces, voterInitialized} from '../stores/voter';
    import SpikeSpinner from "../SpikeSpinner.svelte";
    import RacePreview from "./RacePreview.svelte";

    const racePreviewMax = 3;

    $: races = $voterRaces.slice(0, racePreviewMax)
    $: hiddenRaces = $voterRaces.length - races.length
</script>
