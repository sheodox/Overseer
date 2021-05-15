<style>
    .app-preview {
        margin: 1rem;
        max-width: 85vw;
    }
</style>

<div class="f-row f-wrap justify-content-center">
    {#if window.Booker.events.view}
        <div class="app-preview">
            <EventsAppPreview />
        </div>
    {/if}
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
    import EventsAppPreview from "./events/EventsAppPreview.svelte";

    // clear old page names
    $pageName = '';
</script>
