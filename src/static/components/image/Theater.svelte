<style>
	.theater {
		background: rgba(0, 0, 0, 0.9);
		position: fixed;
		z-index: 1000000;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
	}
	button[aria-pressed='true'] {
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
		border-radius: 5px;
	}
	.selected-image-container {
		position: relative;
		margin: auto 0;
	}
	.prev {
		left: 0;
	}
	.next {
		right: 0;
	}
	.nextprev {
		position: absolute;
		height: 100%;
		width: 30vw;
		font-size: var(--sx-font-size-11);
		color: transparent;
		transition: color 0.2s, background 0.2s, opacity 0.2s;
		margin: 0;
	}
	.nextprev:active {
		opacity: 95% !important;
	}
	.nextprev:hover {
		opacity: 75%;
		color: white;
	}
</style>

<div class="theater f-column" on:click={close} on:keydown={theaterKeyDown} use:initialFocus tabindex="-1">
	<button type="button" class="close" on:click={close}>
		<Icon icon="times" />
		Close
	</button>
	<!-- space out the selected image and selection switcher so the switcher doesn't
    move vertically based on the selected image's height -->
	<div class="f-column justify-content-between f-1">
		<div class="selected-image-container f-row justify-content-center">
			<button
				type="button"
				class="nextprev prev"
				on:click|stopPropagation|preventDefault={() => selectImageByOffset(-1)}
			>
				<span class="sr-only">View previous image</span>
				<Icon icon="chevron-left" variant="icon-only" />
			</button>
			<img
				class="selected-image"
				src={selectedImage.src ? selectedImage.src : `/image/${selectedImage.id}/large`}
				alt={selectedImage.alt || ''}
				on:click={close}
			/>
			<button
				type="button"
				class="nextprev next"
				on:click|stopPropagation|preventDefault={() => selectImageByOffset(1)}
			>
				<span class="sr-only">View previous image</span>
				<Icon icon="chevron-right" variant="icon-only" />
			</button>
		</div>
		<div class="other-images">
			{#each images as image (image.id)}
				<button
					type="button"
					aria-pressed={selectedImage.id === image.id}
					on:click|stopPropagation|preventDefault={() => (selectedImage = image)}
				>
					<img src={image.src ? image.src : `/image/${image.id}/small`} alt={image.alt || ''} />
					<span class="sr-only">View this image full size</span>
				</button>
			{/each}
		</div>
	</div>
</div>

<script lang="ts">
	import Icon from 'sheodox-ui/Icon.svelte';
	import type { AlbumImage } from './Album.svelte';

	export let visible: boolean;
	export let images: AlbumImage[];
	export let selectedImage: AlbumImage;

	function close(e: Event) {
		//Albums/Theaters are in side of a link in Echo, need to not leak clicks or it'll try and follow the link when just looking at images
		e.stopPropagation();
		e.preventDefault();
		visible = false;
	}

	//offset is -1/1, added to the index of the selected image to select the next/previous image
	function selectImageByOffset(offset: number) {
		const newIndex = Math.max(0, Math.min(images.indexOf(selectedImage) + offset, images.length - 1));
		selectedImage = images[newIndex];
	}

	function theaterKeyDown(e: KeyboardEvent) {
		switch (e.key) {
			case 'ArrowLeft':
				selectImageByOffset(-1);
				break;
			case 'ArrowRight':
				selectImageByOffset(1);
				break;
			case 'Escape':
				close(e);
		}
	}

	function initialFocus(theaterElement: HTMLElement) {
		//focus the theater so arrow keys can select images
		theaterElement.focus();
	}
</script>
