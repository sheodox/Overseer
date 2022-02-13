<Album {images} {mode} {size} on:delete />

<script lang="ts">
	import { MaskedCandidate, CandidateImages } from '../../../shared/types/voter';
	import Album, { AlbumMode, AlbumSize } from '../image/Album.svelte';
	export let candidateImages: CandidateImages;
	export let candidate: MaskedCandidate;
	export let mode: AlbumMode = AlbumMode.View;
	export let size: AlbumSize = AlbumSize.Small;

	$: images = candidateImages
		//candidateImages are all images for this race, need to filter down to only images for this candidate
		.filter((image) => image.candidateId === candidate.id)
		.map((image) => {
			//map to a non CandidateImage specific format (though others will probably match this)
			return {
				alt: `Image for ${candidate.name}`,
				//the ID of the image that's served by image middleware
				id: image.imageId,
				//the CandidateImage ID, we need this to know what image to delete
				sourceId: image.id,
			};
		});
</script>
