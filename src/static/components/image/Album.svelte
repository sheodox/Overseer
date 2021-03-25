<style>
    button {
        padding: 0.2rem;
    }
    img {
        width: 7rem;
    }
    .can-zoom {
        cursor: zoom-in;
    }
    .image-container {
        position: relative;
        margin: 0.5rem;
    }
    button.delete-image {
        position: absolute;
        top: 0.2rem;
        right: 0.2rem;
    }
</style>

<div class="f-row f-wrap">
    {#each images as image (image.id)}
        <div class="image-container">
            <button
                class="can-zoom"
                on:click={() => albumImageClick(image)}
            >
                <img src="/image/{image.id}/small" alt={image.alt || ''} />
            </button>
            {#if mode === 'edit'}
                <button
                    class="danger delete-image"
                    title="Delete image"
                    on:click={() => deleteImage(image)}
                >
                    <Icon icon="trash" noPadding={true} />
                    <span class="sr-only">Delete image</span>
                </button>
            {/if}
        </div>
    {/each}
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
