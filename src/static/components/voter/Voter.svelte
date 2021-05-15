<style>
    .voter {
        max-width: 95vw;
    }

    h1 {
        margin: 0;
    }
</style>
{#if !$voterInitialized}
    <PageSpinner />
{:else}
    <div class="voter m-3">
        <div class="f-row justify-content-between align-items-center">
            <h1>
                Races
            </h1>
            {#if window.Booker.voter.add_race}
                <button on:click={() => showAddRace = true} class="primary">
                    <Icon icon="plus" />
                    Add Race
                </button>
            {/if}
        </div>
        <div class="f-row f-wrap justify-content-center gap-3">
            {#each $voterRaces as race}
                <RacePreview {race} />
            {/each}
        </div>
    </div>
{/if}

{#if showAddRace}
    <PromptModal
        bind:visible={showAddRace}
        label="Enter the name for a new race"
        title="Add Race"
        on:save={addRace}
    />
{/if}

<script>
    import {Icon, Modal} from 'sheodox-ui';
    import {voterInitialized, voterOps, voterRaces} from "../stores/voter";
    import PageSpinner from "../PageSpinner.svelte";
    import RacePreview from './RacePreview.svelte';
    import {pageName} from "../stores/app";
    import PromptModal from "../PromptModal.svelte";

    let showAddRace = false;
    pageName.set('Voter');

    function addRace(e) {
        voterOps.race.new(e.detail);
        showAddRace = false;
    }
</script>