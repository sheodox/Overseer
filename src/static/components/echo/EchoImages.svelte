<Album {images} {mode} {size} {variant} on:delete placeholderText={echoItem.name} />

<script lang="ts">
	import type { PreparedEchoItem } from '../../../shared/types/echo';
	import Album, { AlbumMode, AlbumSize, AlbumVariant } from '../image/Album.svelte';

	export let echoItem: PreparedEchoItem;
	export let mode: AlbumMode;
	export let size: AlbumSize;
	export let variant: AlbumVariant;

	$: images = echoItem.images.map((image) => {
		return {
			alt: `Image for ${echoItem.name}`,
			//the ID of the image that's served by image middleware
			id: image.imageId,
			//the EchoImage ID, we need this to know what image to delete
			sourceId: image.id,
		};
	});
</script>
