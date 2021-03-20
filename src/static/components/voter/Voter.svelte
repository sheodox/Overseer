<style>
    .page-content {
        margin: 1rem;
    }
</style>
{#if !$voterInitialized}
    <PageSpinner />
{:else}
    <div class="page-content">
        <div class="panel panel-body bordered">
            <div class="toolbar">
                <button on:click={() => showAddRace = true}>
                    <Icon icon="plus" />
                    Add Race
                </button>
            </div>
            <div class="f-row f-wrap justify-content-center">
                {#each $voterRaces as race}
                    <RacePreview {race} />
                {/each}
            </div>
        </div>
    </div>
{/if}

{#if showAddRace}
    <Modal bind:visible={showAddRace} title="Add Race">
        <form on:submit|preventDefault={addRace}>
            <div class="modal-body">
                <label>
                    Race Name
                    <br>
                    <input bind:value={newRaceName} />
                </label>
            </div>

            <div class="modal-footer">
                <button type="button" on:click={() => showAddRace = false}>
                    Cancel
                </button>
                <button disabled={!newRaceName}>
                    Add
                </button>
            </div>
        </form>
    </Modal>
{/if}

<script>
    import {Icon, Modal} from 'sheodox-ui';
    import {voterInitialized, voterOps, voterRaces} from "../stores/voter";
    import PageSpinner from "../PageSpinner.svelte";
    import RacePreview from './RacePreview.svelte';
    import {pageName} from "../stores/app";

    let showAddRace = false,
        newRaceName = '';
    pageName.set('Voter');

    function addRace() {
        voterOps.race.new(newRaceName);
        showAddRace = false;
    }
</script>