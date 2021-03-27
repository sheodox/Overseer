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
    .small .image {
        --placeholder-width: 7rem;
    }
    .medium .image {
        --placeholder-width: 34rem;
    }
    .image {
        background: var(--panel-header-bg-dark);
        --placeholder-max-width: 90vw;
        max-width: var(--placeholder-max-width);
        max-height: calc(var(--placeholder-max-width) * (9/16));
        font-size: 1.5rem;
    }
    .image.placeholder {
        width: var(--placeholder-width);
        height: calc(var(--placeholder-width) * (9 / 16));
    }
</style>

<div class="f-row f-wrap {variant} {size}">
    {#each viewableImages as image (image.id)}
        <div class="image-container">
            <button
                class="view-theater-button"
                on:click={() => albumImageClick(image)}
            >
                <img src="/image/{image.id}/{size}" alt={image.alt || ''} class="image"/>
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
    {:else}
        {#if variant === 'cover'}
            <!-- cover images are expected to take up space, so we need something when we have no images -->
            <div class="image placeholder text-align-center f-1 justify-content-center f-column">{placeholderText}</div>
        {/if}
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
    export let placeholderText = '';
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
