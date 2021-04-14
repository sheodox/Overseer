<style>

</style>

<nav>
    <ul>
        {#each links as link}
            {#if link.viewable}
                <li>
                    <a
                        on:click|preventDefault={() => page(link.path)}
                        class:active={link.app === $activeApp}
                        href={link.path}
                    >
                        {link.text}
                    </a>
                </li>
            {/if}
        {/each}
        {#if window.Booker.app.notifications}
            <NotificationTrigger />
        {/if}
    </ul>
</nav>

<script>
    import {activeApp} from "./stores/routing";
    import page from 'page';
    import NotificationTrigger from "./notifications/NotificationTrigger.svelte";

    const links = [{
        viewable: window.Booker.echo.view || window.Booker.voter.view,
        path: '/',
        app: 'home',
        text: 'Home',
        icon: 'home'
    }, {
        viewable: window.Booker.events.view,
        path: '/events',
        app: 'events',
        text: 'Events',
        icon: 'calendar-week'
    }, {
        viewable: window.Booker.echo.view,
        path: '/echo',
        app: 'echo',
        text: 'Echo',
        icon: 'download'
    }, {
        viewable: window.Booker.voter.view,
        path: '/voter',
        app: 'voter',
        text: 'Voter',
        icon: 'vote-yea'
    }];
</script>