<Album {images} {mode} on:delete />

<script>
    import Album from "../image/Album.svelte";
    export let echoItem;
    export let mode;

    $: images = echoItem.images
        .map(image => {
            return {
                alt:`Image for ${echoItem.name}`,
                //the ID of the image that's served by image middleware
                id: image.imageId,
                //the EchoImage ID, we need this to know what image to delete
                sourceId: image.id
            };
        });
</script>
