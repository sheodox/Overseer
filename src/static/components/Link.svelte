<a href={href} on:click|preventDefault={() => page(href)}>
    <slot />
</a>

<script>
    import page from 'page';
    export let href
</script>