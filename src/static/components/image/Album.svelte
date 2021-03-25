<style>
    button {
        padding: 0.2rem;
    }
    img {
        width: 7rem;
    }
    img.can-zoom {
        cursor: zoom-in;
    }
    .edit-image-container {
        position: relative;
        margin: 0.5rem;
    }
    .edit-image-container button {
        position: absolute;
        top: 0.2rem;
        right: 0.2rem;
    }
</style>

<div class="f-row f-wrap">
    {#if mode === 'view'}
        {#each images as image (image.id)}
            <button
                class="can-zoom"
                on:click={() => albumImageClick(image)}
            >
                <img src="/image/{image.id}/small" alt={image.alt || ''} />
            </button>
        {/each}
    {/if}
    {#if mode === 'edit'}
        {#each images as image (image.id)}
            <div class="edit-image-container">
                <img src="/image/{image.id}/small" alt={image.alt || ''} />
                <button
                    class="danger"
                    title="Delete image"
                    on:click={() => deleteImage(image)}
                >
                    <Icon icon="trash" noPadding={true} />
                    <span class="sr-only">Delete image</span>
                </button>
            </div>
        {/each}
    {/if}
</div>

{#if showTheater}
    <Theater {selectedImage} {images} bind:visible={showTheater} />
{/if}

<script>
    import {createEventDispatcher} from 'svelte';
    import {Icon} from 'sheodox-ui';
    import Theater from "./Theater.svelte";
    const dispatch = createEventDispatcher();

    export let mode = 'view';
    export let images

    let selectedImage,
        showTheater = false;

    function albumImageClick(image) {
        selectedImage = image;
        showTheater = true;
    }

    function deleteImage(image) {
        dispatch('delete', image.sourceId);
    }
</script>
