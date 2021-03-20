<style>
    main {
        flex: 1;
        position: relative;
    }
    :global(header h1) {
        font-family: "Kanit", sans-serif;
    }
</style>

<Header appName="Overseer" pageName={$pageName}>
    <SVG svgId="logo" slot="logo" />
    <HeaderNav slot="nav" />
</Header>
<main class="f-column justify-content-start align-items-center">
    <Toasts />
    {#if window.user}
        <Routing />
    {:else}
        <LoginRequired />
    {/if}
</main>
<Footer>
    <div class="page-content">
        <nav class="simple-footer-links">
            <ul>
                {#each footerLinks as link}
                    <li><a href={link.href}>
                        <Icon icon={link.icon} />
                        {link.text}
                    </a></li>
                {/each}
            </ul>
        </nav>
    </div>
</Footer>

<script>
    import {Toasts, Icon, Header, Footer} from 'sheodox-ui';
    import {pageName} from "./stores/app";
    import SVG from './SVG.svelte';
    import Routing from "./Routing.svelte";
    import LoginRequired from "./LoginRequired.svelte";
    import HeaderNav from "./HeaderNav.svelte";

    const footerLinks = window.user?.links || [];
</script>