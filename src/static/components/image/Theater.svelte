<style>
    .theater {
        background: rgba(0, 0, 0, 0.9);
        position: fixed;
        z-index: 100;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
    }
    button[aria-pressed="true"] {
        opacity: 0.5;
    }
    .selected-image {
        max-width: 90%;
        /* pending upload images that are in full resolution can be really big!
         too big and it'll push the image selector off the page */
        max-height: 75vh;
        cursor: zoom-out;
    }
    .other-images {
        overflow-x: auto;
        white-space: nowrap;
        text-align: center;
    }
    .other-images img {
        max-width: 7rem;
    }
    .selected-image-container {
        position: relative;
    }
    .prev {
        left: 0;
        cursor: w-resize;
    }
    .next {
        right: 0;
        cursor: e-resize;
    }
    .prev, .next {
        position: absolute;
        height: 100%;
        width: 30vw;
    }
</style>

<div
    class="theater f-column"
    on:click={close}
    on:keydown={theaterKeyDown}
    use:initialFocus
    tabindex="-1"
>
    <button
        type="button"
        class="close"
        on:click={close}
    >
        <Icon icon="times" />
        Close
    </button>
    <!-- space out the selected image and selection switcher so the switcher doesn't
    move vertically based on the selected image's height -->
    <div class="f-column justify-content-between f-1">
        <div class="selected-image-container f-row justify-content-center">
            <button type="button" class="prev" on:click|stopPropagation|preventDefault={() => selectImageByOffset(-1)}>
                <span class="sr-only">View previous image</span>
            </button>
            <img class="selected-image"
                 src={selectedImage.src ? selectedImage.src : `/image/${selectedImage.id}/large`}
                 alt={selectedImage.alt || ''} on:click={close}
            />
            <button type="button" class="next" on:click|stopPropagation|preventDefault={() => selectImageByOffset(1)}>
                <span class="sr-only">View previous image</span>
            </button>
        </div>
        <div class="other-images">
            {#each images as image (image.id)}
                <button
                    type="button"
                    aria-pressed={selectedImage.id === image.id}
                    on:click|stopPropagation|preventDefault={() => selectedImage = image}
                >
                    <img src={image.src ? image.src : `/image/${image.id}/small`} alt={image.alt || ''} />
                    <span class="sr-only">View this image full size</span>
                </button>
            {/each}
        </div>
    </div>
</div>

<script>
    import {Icon} from 'sheodox-ui';
    export let visible;
    export let images;
    export let selectedImage;

    function close(e) {
        //Albums/Theaters are in side of a link in Echo, need to not leak clicks or it'll try and follow the link when just looking at images
        e.stopPropagation();
        e.preventDefault();
        visible = false;
    }

    //offset is -1/1, added to the index of the selected image to select the next/previous image
    function selectImageByOffset(offset) {
        const newIndex = Math.max(0, Math.min(images.indexOf(selectedImage) + offset, images.length - 1));
        selectedImage = images[newIndex];
    }

    function theaterKeyDown(e) {
        switch (e.key) {
            case 'ArrowLeft':
                selectImageByOffset(-1);
                break;
            case 'ArrowRight':
                selectImageByOffset(1);
                break;
            case 'Escape':
                close();
        }
    }

    function initialFocus(theaterElement) {
        //focus the theater so arrow keys can select images
        theaterElement.focus();
    }
</script>