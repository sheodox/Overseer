<style>
	h1 {
		margin: 0;
	}
	@media (max-width: 800px) {
		.details {
			flex-direction: column;
		}
	}
	.page-content {
		margin: 1rem;
		padding: 1rem;
	}
	.details {
		display: flex;
	}
	.column {
		margin: 0.5rem;
	}
	textarea {
		width: 100%;
		height: 10rem;
		font-size: 0.9rem;
		resize: vertical;
	}
	.field {
		margin: 1rem 0;
	}
</style>

<div class="page-content">
	<form on:submit|preventDefault={submit}>
		<h1>{echoItem ? echoItem.name : 'Echo Upload'}</h1>
		<div class="details">
			<div class="column f-1">
				<EchoFileSelect bind:file {mode} />
				<div class="field">
					<TextInput bind:value={name} id="echo-name">Name</TextInput>
				</div>
				<div class="field">
					<TextInput bind:value={tags} id="echo-tags">Tags</TextInput>
				</div>
				<TagCloud bind:tags />
			</div>
			<div class="column f-2">
				<label for="echo-notes">Notes</label>
				<br />
				<textarea id="echo-notes" bind:value={notes} on:paste={notesPaste} />
				<p>
					<Icon icon="info-circle" /> Notes can use markdown!
					{#if booker.echo.add_image}
						You can add images by pasting them into the Notes box.
					{/if}
				</p>
				<div class="f-row justify-content-end">
					{#if echoItem}
						<Link href={echoItem.path}>
							<span class="button">
								<Icon icon="chevron-left" />
								Back
							</span>
						</Link>
					{/if}
					<button disabled={!name || (mode === EchoUploadMode.Upload && !file) || uploading} class="primary">
						{#if mode === EchoUploadMode.Upload}
							<Icon icon="upload" />
							Upload
						{:else}
							<Icon icon="save" />
							{file ? 'Update and upload' : 'Update'}
						{/if}
					</button>
				</div>
				{#if imagesPendingUpload.length}
					<div class="f-row justify-content-center f-wrap">
						<Album
							mode={AlbumMode.Edit}
							images={imagesPendingUpload}
							size={AlbumSize.Small}
							on:delete={cancelPendingImage}
						/>
					</div>
				{/if}
				{#if echoItem && booker.echo.remove_image}
					<EchoImages
						{echoItem}
						mode={AlbumMode.Edit}
						size={AlbumSize.Small}
						variant={AlbumVariant.Strip}
						on:delete={deleteImage}
					/>
				{/if}
			</div>
		</div>
	</form>
</div>

<script context="module" lang="ts">
	export enum EchoUploadMode {
		Edit,
		Upload,
	}
</script>

<script lang="ts">
	import { createAutoExpireToast } from 'sheodox-ui';
	import Icon from 'sheodox-ui/Icon.svelte';
	import TextInput from 'sheodox-ui/TextInput.svelte';
	import EchoFileSelect from './EchoFileSelect.svelte';
	import { echoItems, echoOps } from '../stores/echo';
	import { pageName, booker } from '../stores/app';
	import { activeRouteParams } from '../stores/routing';
	import page from 'page';
	import TagCloud from './TagCloud.svelte';
	import EchoImages from './EchoImages.svelte';
	import Link from '../Link.svelte';
	import Album, { AlbumImage, AlbumMode, AlbumVariant, AlbumSize } from '../image/Album.svelte';
	import { PreparedEchoItem } from '../../../shared/types/echo';

	export let mode: EchoUploadMode;

	let name: string,
		tags: string,
		notes: string,
		file: File,
		//used to disable the submit button and prevent double uploads
		uploading = false,
		//used to generate a unique 'key' for each image pending upload
		pendingImageId = 0,
		//`file` objects are attached here when attaching images when making a new upload
		imagesPendingUpload: (AlbumImage & Required<Pick<AlbumImage, 'file'>>)[] = [];

	pageName.set(mode === EchoUploadMode.Upload ? 'Upload' : 'Edit');

	$: suggestName(file?.name);
	$: echoItem = mode === EchoUploadMode.Edit ? findItem($echoItems) : null;

	let seededEditData = false;

	function findItem(echoItems: PreparedEchoItem[]) {
		const item = echoItems.find(({ id }) => id === $activeRouteParams.echoId);
		if (!seededEditData && item) {
			name = item.name;
			tags = item.tags;
			notes = item.notes;
			seededEditData = true;
		}
		return item;
	}

	function suggestName(fileName: string) {
		if (fileName && !name) {
			name = fileName.replace(/\.zip$/, '');
		}
	}

	function cancelPendingImage(e: CustomEvent<string>) {
		if (confirm(`Are you sure you want to delete this image?`)) {
			imagesPendingUpload = imagesPendingUpload.filter((image) => image.sourceId !== e.detail);
		}
	}

	async function notesPaste(e: ClipboardEvent) {
		const file = e.clipboardData.files[0];
		if (file && booker.echo.add_image) {
			e.preventDefault();

			if (['image/png', 'image/jpeg'].includes(file.type)) {
				if (!echoItem) {
					const newImageId = pendingImageId++;

					imagesPendingUpload = [
						...imagesPendingUpload,
						{
							file,
							src: await file.arrayBuffer().then((buffer) => URL.createObjectURL(new Blob([buffer]))),
							alt: 'pending image upload',
							// if the image is deleted we'll get this back and know to remove it from the pending image array
							sourceId: '' + newImageId,
							// album needs this for keys!
							id: '' + newImageId,
						},
					];
				} else {
					echoOps.uploadImage(echoItem.id, file);
				}
			} else {
				createAutoExpireToast({
					variant: 'error',
					title: 'Upload Error',
					message: 'Invalid file type!',
				});
			}
		}
	}

	function deleteImage(e: CustomEvent<string>) {
		if (confirm('Are you sure you want to delete this image?')) {
			echoOps.deleteImage(e.detail);
		}
	}

	async function submit() {
		uploading = true;
		//update the item just so it updates the header
		if (echoItem) {
			echoItem.name = name;
		}

		const redirect = (id: string) => page(`/echo/${id}`);

		if (mode === EchoUploadMode.Upload) {
			const id = await echoOps.upload(
				null,
				{
					name,
					tags,
					notes,
				},
				file
			);
			redirect(id);

			if (!imagesPendingUpload.length) {
				return;
			}

			for (const image of imagesPendingUpload) {
				await echoOps.uploadImage(id, image.file);
			}

			createAutoExpireToast({
				variant: 'info',
				title: `Echo Upload - ${name}`,
				message: 'All images uploaded!',
			});
		} else if (file) {
			await echoOps.upload(
				echoItem.id,
				{
					name,
					tags,
					notes,
				},
				file
			);
			redirect(echoItem.id);
		} else {
			echoOps.update(echoItem.id, {
				name,
				tags,
				notes,
			});
			redirect(echoItem.id);
		}
	}
</script>
