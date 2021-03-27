<style>
    .image-container {
        position: relative;
        margin: 1rem;
    }
    img {
        width: 7rem;
    }
    button.danger {
        top: 0.2rem;
        right: 0.2rem;
        position: absolute;
    }
</style>

{#if src}
    <div class="image-container">
        <img {src} alt="pending image upload" />
        <button class="danger small" on:click={() => dispatch('delete')}>
            <Icon icon="trash" noPadding={true} />
            <span class="sr-only">Delete Image</span>
        </button>
    </div>
{/if}
<script>
    import {createEventDispatcher} from 'svelte';
    import {Icon} from 'sheodox-ui';
    const dispatch = createEventDispatcher();

    export let file;
    let src;
    file.arrayBuffer()
        .then(buffer => {
            src = URL.createObjectURL(new Blob([buffer]))
        })
</script>