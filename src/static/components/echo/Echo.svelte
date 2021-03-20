<style>
    .offline-message {
        margin: 0.5rem;
    }
    table {
        width: 100%;
    }
    .input-group {
        margin: 0.5rem;
    }
    .input-group label {
        padding: 0.5rem;
    }
</style>

<div class="page-content f-column f-1">
    {#if !$echoInitialized}
        <PageSpinner />
    {:else}
        {#if $echoOnline}
            <div class="f-row justify-content-between align-items-center">
                <EchoStatus />
                <button on:click={() => page('/echo/upload')}>
                    <Icon icon="upload" />
                    New Upload
                </button>
            </div>
        {:else}
            <div class="f-row justify-content-center">
            <span class="offline-message">
                <Icon icon="power-off" />
                Echo is offline!
            </span>
            </div>
        {/if}

        <div class="panel panel-body bordered f-column">
            <div class="f-row align-items-center">
                <div class="input-group f-1">
                    <label for="echo-search">
                        <Icon icon="search" />
                        <span class="sr-only">
                            Search
                        </span>
                    </label>
                    <input bind:value={$echoSearch} id="echo-search" placeholder="search for a name or tags (comma separated)" class="f-1"/>
                    <button on:click={() => $echoSearch = ''}>
                        <Icon icon="times" />
                        Reset
                    </button>
                </div>
                <button on:click={() => showTagCloud = !showTagCloud}>
                    {showTagCloud ? 'Hide' : 'Show'} Tags
                </button>
            </div>
            {#if showTagCloud}
                <TagCloud bind:tags={$echoSearch}/>
            {/if}

            {#if $echoSearchResults.length}
                <table class="hoverable">
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>Size</th>
                        <th>Updated</th>
                    </tr>
                    </thead>
                    <tbody>
                    {#each $echoSearchResults as item}
                        <tr>
                            <td>
                                <a href={item.path} on:click|preventDefault={() => page(item.path)}>{item.name}</a>
                            </td>
                            <td>
                                <FileSize echoItem={item} />
                            </td>
                            <td>{new Date(item.updatedAt).toLocaleDateString()}</td>
                        </tr>
                    {/each}
                    </tbody>
                </table>
            {:else}
                <p class="text-align-center">
                    No items matching this search.
                </p>
            {/if}
        </div>
    {/if}
</div>

<script>
    import page from 'page';
    import {Icon} from 'sheodox-ui';
    import {echoInitialized, echoOnline, echoSearch, echoSearchResults} from "../stores/echo";
    import {pageName} from "../stores/app";
    import EchoStatus from "./EchoStatus.svelte";
    import FileSize from "./FileSize.svelte";
    import TagCloud from "./TagCloud.svelte";
    import {activeQueryParams} from "../stores/routing";
    import PageSpinner from "../PageSpinner.svelte";

    let showTagCloud = false;

    pageName.set('Echo');

    echoSearch.set($activeQueryParams.search);
</script>