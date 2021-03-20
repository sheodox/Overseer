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
                        <Icon icon={link.icon} />
                        {link.text}
                    </a>
                </li>
            {/if}
        {/each}
    </ul>
</nav>

<script>
    import {Icon} from 'sheodox-ui';
    import {activeApp} from "./stores/routing";
    import page from 'page';

    const links = [{
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