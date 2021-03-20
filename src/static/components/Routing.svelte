{#if $activeRoute === 'echo' && echoView}
    <Echo />
{:else if $activeRoute === 'echo/upload' && echoView}
    <EchoUpload mode="upload" />
{:else if $activeRoute === 'echo/edit' && echoView}
    <EchoUpload mode="edit" />
{:else if $activeRoute === 'echo/view' && echoView}
    <EchoView />
{:else if $activeRoute === 'voter' && voterView}
    <Voter />
{:else if $activeRoute === 'voter/race' && voterView}
    <VoterRace />
{/if}
<script>
    import {activeRoute} from './stores/routing';
    import Echo from "./echo/Echo.svelte";
    import EchoUpload from "./echo/EchoUpload.svelte";
    import EchoView from "./echo/EchoView.svelte";
    import Voter from "./voter/Voter.svelte";
    import VoterRace from "./voter/VoterRace.svelte";

    const echoView = window.Booker.echo.view,
        voterView = window.Booker.echo.view;
</script>