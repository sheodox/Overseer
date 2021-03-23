<style>
    .app-preview {
        margin: 1rem;
        max-width: 90%
    }
</style>

<div class="page-content f-row f-wrap justify-content-center">
    {#if window.Booker.echo.view}
        <div class="app-preview">
            <RecentUploads />
        </div>
    {/if}
    {#if window.Booker.voter.view}
        <div class="app-preview">
            <VoterPreview />
        </div>
    {/if}
</div>

<script>
    import RecentUploads from "./echo/RecentUploads.svelte";
    import VoterPreview from "./voter/VoterPreview.svelte";
    import {pageName} from "./stores/app";

    // clear old page names
    $pageName = '';
</script>
