<style>
    .no-hover-styles {
        text-decoration: none;
    }
</style>
<a
    href={href}
    on:click|preventDefault={follow}
    class:no-hover-styles={noHoverStyles}
>
    <slot />
</a>

<script>
    import {createEventDispatcher} from 'svelte';
    import page from 'page';
    export let href
    export let noHoverStyles;
    const dispatch = createEventDispatcher();

    function follow() {
        page(href)
        dispatch('followed');
    }
</script>