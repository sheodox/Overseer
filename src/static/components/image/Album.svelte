<style lang="scss">
	.view-theater-button {
		cursor: zoom-in;
		padding: 0;
	}
	.image-container {
		position: relative;
	}
	.strip {
		--placeholder-max-width: 90%;
		.image-container {
			margin: 0.5rem;
		}
		img {
			width: var(--placeholder-width);
			border-radius: 10px;
		}
	}
	.cover {
		--placeholder-max-width: 90vw;
		.view-theater-button {
			margin: 0;
		}
	}
	button.delete-image {
		position: absolute;
		top: 0.2rem;
		right: 0.2rem;
	}
	.small .image {
		--placeholder-width: 10rem;
	}
	.medium .image {
		--placeholder-width: 34rem;
	}
	.image {
		background: var(--shdx-panel-header-bg-dark);
		max-width: var(--placeholder-max-width);
		max-height: calc(var(--placeholder-max-width) * (9 / 16));
		font-size: 1.5rem;
	}
	.image.placeholder {
		width: var(--placeholder-width);
		height: calc(var(--placeholder-width) * (9 / 16));
	}
</style>

<div class="f-row f-wrap justify-content-center {variant} {size}" on:click|stopPropagation|preventDefault>
	{#each viewableImages as image (image.id)}
		<div class="image-container">
			<button type="button" class="view-theater-button" on:click={() => albumImageClick(image)}>
				<img src={image.src ? image.src : `/image/${image.id}/${size}`} alt={image.alt || ''} class="image" />
			</button>
			{#if mode === AlbumMode.Edit}
				<button
					type="button"
					class="danger small delete-image"
					title="Delete image"
					on:click={() => deleteImage(image)}
				>
					<Icon icon="trash" variant="icon-only" />
					<span class="sr-only">Delete image</span>
				</button>
			{/if}
		</div>
	{:else}
		{#if variant === AlbumVariant.Cover}
			<!-- cover images are expected to take up space, so we need something when we have no images -->
			<div class="image placeholder text-align-center f-1 justify-content-center f-column">{placeholderText}</div>
		{/if}
	{/each}
</div>

{#if showTheater}
	<Portal>
		<div on:click|stopPropagation|preventDefault>
			<Theater {selectedImage} {images} bind:visible={showTheater} />
		</div>
	</Portal>
{/if}

<script lang="ts" context="module">
	export enum AlbumMode {
		View = 'view',
		Edit = 'edit',
	}
	export enum AlbumSize {
		Small = 'small',
		Medium = 'medium',
		Large = 'large',
	}
	export enum AlbumVariant {
		Cover = 'cover', // a single image covering its container
		Strip = 'strip', // a strip of multiple images
	}
	export interface AlbumImage {
		id: string;
		src?: string;
		file?: File;
		alt?: string;
		sourceId: string;
	}
</script>

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Icon, Portal } from 'sheodox-ui';
	import Theater from './Theater.svelte';
	const dispatch = createEventDispatcher();

	export let mode: AlbumMode = AlbumMode.View;
	export let size: AlbumSize = AlbumSize.Small; //ImageStore image size
	export let variant: AlbumVariant = AlbumVariant.Strip; //cover (one image at a time) | strip (all images at once)
	export let images: AlbumImage[];
	export let placeholderText = '';
	$: viewableImages = variant === AlbumVariant.Cover ? images.slice(0, 1) : images;

	let selectedImage: AlbumImage,
		showTheater = false;

	function albumImageClick(image: AlbumImage) {
		selectedImage = image;
		showTheater = true;
	}

	function deleteImage(image: AlbumImage) {
		dispatch('delete', image.sourceId);
	}
</script>
