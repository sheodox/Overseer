<style>
    .no-hover-styles {
        text-decoration: none;
    }
</style>
<a
    href={href}
    on:click|preventDefault={() => page(href)}
    class:no-hover-styles={noHoverStyles}
>
    <slot />
</a>

<script>
    import page from 'page';
    export let href
    export let noHoverStyles;
</script>