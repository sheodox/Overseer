<Album {images} {mode} on:delete />

<script>
    import Album from "../image/Album.svelte";
    export let candidateImages;
    export let candidate;
    export let mode;

    $: images = candidateImages
        //candidateImages are all images for this race, need to filter down to only images for this candidate
        .filter(image => image.candidateId === candidate.id)
        .map(image => {
            //map to a non CandidateImage specific format (though others will probably match this)
            return {
                alt:`Image for ${candidate.name}`,
                //the ID of the image that's served by image middleware
                id: image.imageId,
                //the CandidateImage ID, we need this to know what image to delete
                sourceId: image.id
            };
        });
</script>