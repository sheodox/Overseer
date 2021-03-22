<style>
    .panel {
        margin: 1rem;
    }
    .app-preview {
        margin: 1rem;
    }
</style>

<div class="panel bordered panel-body f-row f-wrap">
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
