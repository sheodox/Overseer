<style>
    .offline-message {
        margin: 0.5rem;
    }
    .input-group {
        margin: 0.5rem;
    }
    .input-group input {
        font-size: 0.9rem;
    }
    .input-group label {
        padding: 0.5rem;
    }
    .page-content {
        max-width: 60rem;
        margin: 1rem;
    }
    h1 {
        margin: 0;
    }
    .view-modes [aria-pressed="true"] {
        color: var(--accent-pink);
    }
</style>

<div class="f-column f-1 align-items-center">
    <div class="page-content f-column">
        {#if !$echoInitialized}
            <PageSpinner />
        {:else}
            <div class="f-column">
                <div class="f-row justify-content-between">
                    <h1>Uploads</h1>
                    {#if $echoOnline && window.Booker.echo.upload}
                        <button on:click={() => page('/echo/upload')}>
                            <Icon icon="upload" />
                            New Upload
                        </button>
                    {/if}
                </div>
                <div class="f-row justify-content-between">
                    {#if $echoOnline}
                        <EchoStatus />
                    {:else}
                    <span class="offline-message">
                        <Icon icon="power-off" />
                        Echo is offline!
                    </span>
                    {/if}
                </div>

                <div class="f-row align-items-center">
                    <div class="input-group f-1">
                        <label for="echo-search">
                            <Icon icon="search" noPadding={true} />
                            <span class="sr-only">
                            Search
                        </span>
                        </label>
                        <input bind:value={$echoSearch} id="echo-search" placeholder="search for a name or tags (comma separated)" class="f-1"/>
                        <button on:click={() => $echoSearch = ''}>
                            <Icon icon="times" noPadding={true} />
                            <span class="sr-only">
                            Reset search
                        </span>
                        </button>
                    </div>
                    <button on:click={() => showTagCloud = !showTagCloud}>
                        {showTagCloud ? 'Hide' : 'Show'} Tags
                    </button>
                </div>
                {#if showTagCloud}
                    <TagCloud bind:tags={$echoSearch}/>
                {/if}
                <div class="f-row justify-content-end view-modes">
                    <button class="small" on:click={() => view = 'list'} aria-pressed={view === 'list'}>
                        <Icon icon="list" />
                        <span class="sr-only">View as a list</span>
                    </button>
                    <button class="small" on:click={() => view = 'grid'} aria-pressed={view === 'grid'}>
                        <Icon icon="th" />
                        <span class="sr-only">View as a grid</span>
                    </button>
                </div>
            </div>
        {/if}
    </div>

    {#if numResults > 0}
        <div class={view === 'grid' ? "f-row f-wrap justify-content-center" : 'page-content'}>
            {#each $echoSearchResults as item}
                <EchoItemPreview {item} variant={view} />
            {/each}
        </div>
        <p class="text-align-center">
            {numResults === 1 ? 'one result' : `${numResults} results`}
        </p>
    {:else}
        <p class="text-align-center">
            No items matching this search.
        </p>
    {/if}
</div>

<script>
    import page from 'page';
    import {Icon} from 'sheodox-ui';
    import {echoInitialized, echoOnline, echoSearch, echoSearchResults} from "../stores/echo";
    import {pageName} from "../stores/app";
    import EchoStatus from "./EchoStatus.svelte";
    import TagCloud from "./TagCloud.svelte";
    import {activeQueryParams} from "../stores/routing";
    import PageSpinner from "../PageSpinner.svelte";
    import EchoItemPreview from "./EchoItemPreview.svelte";

    let showTagCloud = false;
    let view = 'grid';

    $: numResults = $echoSearchResults.length

    $pageName = 'Echo'

    echoSearch.set($activeQueryParams.search);
</script>