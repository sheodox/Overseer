<style>
    button {
        padding: 0;
    }
    .view-theater-button {
        cursor: zoom-in;
    }
    .image-container {
        position: relative;
    }
    .strip .image-container {
        margin: 0.5rem;
    }
    button.delete-image {
        position: absolute;
        top: 0.2rem;
        right: 0.2rem;
    }
    .cover .view-theater-button {
        margin: 0;
    }
</style>

<div class="f-row f-wrap {variant}">
    {#each viewableImages as image (image.id)}
        <div class="image-container {size}">
            <button
                class="view-theater-button"
                on:click={() => albumImageClick(image)}
            >
                <img src="/image/{image.id}/{size}" alt={image.alt || ''} />
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
    export let size = 'small'; //ImageStore image size
    export let variant = 'strip'; //cover (one image at a time) | strip (all images at once)
    export let images
    $: viewableImages = variant === 'cover' ? images.slice(0, 1) : images;

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
