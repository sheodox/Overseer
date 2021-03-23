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
        cursor: zoom-out;
    }
    .other-images {
        overflow-x: auto;
        white-space: nowrap;
        text-align: center;
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
        class="close"
        on:click={close}
    >
        <Icon icon="times" />
        Close
    </button>
    <!-- space out the selected image and selection switcher so the switcher doesn't
    move vertically based on the selected image's height -->
    <div class="f-column justify-content-between f-1">
        <img class="selected-image align-self-center"
             src="/image/{selectedImage.id}/large"
             alt={selectedImage.alt || ''} on:click={close}/>
        <div class="other-images">
            {#each images as image (image.id)}
                <button
                    aria-pressed={selectedImage.id === image.id}
                    on:click|stopPropagation={() => selectedImage = image}
                >
                    <img src="/image/{image.id}/small" alt={image.alt || ''} />
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

    function close() {
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