<style>
	ul button {
		width: 8rem;
	}
	.tag {
		margin: 0.2rem;
	}
	.partially-hidden {
		transition: max-width 0.6s;
		overflow: hidden;
		white-space: nowrap;
	}
	.partially-hidden:not(:hover) {
		opacity: 0.2;
		max-width: 1rem;
	}
	.partially-hidden:hover {
		opacity: 1;
		max-width: 100%;
		margin-right: 1rem;
	}
</style>

{#if !echoItem && $echoInitialized}
	<p>Couldn't find an upload for this ID, did it get deleted?</p>
	<p><Link href="/echo">Back to the upload list.</Link></p>
{:else if echoItem}
	<PageLayout title={echoItem.name}>
		<div slot="beside-title">
			{#if hasOptionPermission}
				<MenuButton>
					<span slot="trigger">
						Menu
						<Icon icon="chevron-down" />
					</span>
					<ul slot="menu">
						{#if booker.echo.update}
							<li>
								<a class="button" href={echoItem.editPath} on:click|preventDefault={() => page(echoItem.editPath)}>
									<Icon icon="edit" />
									Edit
								</a>
							</li>
						{/if}
						{#if booker.echo.delete}
							<li>
								<button on:click={() => (showDeleteConfirm = true)}>
									<Icon icon="trash" />
									Delete
								</button>
							</li>
						{/if}
					</ul>
				</MenuButton>
			{/if}
		</div>
		<div class="f-row">
			<div class:partially-hidden={hasBeenUpdated}>
				<UserBubble userId={echoItem.initialUploaderId}>
					<em>Added {echoItem.createdAt.toLocaleDateString()}</em>
				</UserBubble>
			</div>

			{#if hasBeenUpdated}
				<UserBubble userId={echoItem.lastUploaderId}>
					<em>Updated {echoItem.updatedAt.toLocaleDateString()}</em>
				</UserBubble>
			{/if}
		</div>
		<div class="f-row justify-content-between">
			<span class="has-inline-links">
				{#each tags as tag}
					<a href={tag.path} on:click|preventDefault={() => page(tag.path)} class="tag">{tag.text}</a>
				{/each}
			</span>
		</div>
		<div class="notes has-inline-links">
			{@html echoItem.notesRendered}
		</div>
		<EchoDownloadLink {echoItem}>
			<span class="fw-bold">
				<Icon icon="download" />
				Download (<FileSize {echoItem} />)
			</span>
		</EchoDownloadLink>
	</PageLayout>
	<div class="f-row f-wrap">
		<EchoImages mode={AlbumMode.View} size={AlbumSize.Medium} variant={AlbumVariant.Strip} {echoItem} />
	</div>
{/if}

{#if showDeleteConfirm}
	<Modal bind:visible={showDeleteConfirm} title="Delete?">
		<div class="modal-body">
			<p>Are you sure you want to delete <em>{echoItem.name}?</em></p>
		</div>
		<div class="modal-footer">
			<button on:click={() => (showDeleteConfirm = false)}> Cancel </button>
			<button on:click={deleteItem} class="danger">
				<Icon icon="trash" />
				Delete
			</button>
		</div>
	</Modal>
{/if}

<script lang="ts">
	import page from 'page';
	import Icon from 'sheodox-ui/Icon.svelte';
	import MenuButton from 'sheodox-ui/MenuButton.svelte';
	import Modal from 'sheodox-ui/Modal.svelte';
	import { pageName, scrollPageToTop, booker } from '../stores/app';
	import { activeRouteParams } from '../stores/routing';
	import { echoInitialized, echoItems, echoOps } from '../stores/echo';
	import FileSize from './FileSize.svelte';
	import UserBubble from '../UserBubble.svelte';
	import Link from '../Link.svelte';
	import EchoDownloadLink from './EchoDownloadLink.svelte';
	import EchoImages from './EchoImages.svelte';
	import PageLayout from '../../layouts/PageLayout.svelte';
	import { AlbumMode, AlbumSize, AlbumVariant } from '../image/Album.svelte';

	const hasOptionPermission = booker.echo.update || booker.echo.delete;
	let showDeleteConfirm = false;
	scrollPageToTop();

	$: echoItem = $echoItems.find(({ id }) => id === $activeRouteParams.echoId);
	$: tags = processTags(echoItem?.tags);
	$: hasBeenUpdated = echoItem?.updatedAt !== echoItem?.createdAt;

	$: pageName.set(echoItem?.name);

	function processTags(tags: string) {
		return (tags?.split(', ') || []).map((tag) => {
			return {
				text: tag,
				path: `/echo?search=${encodeURIComponent(tag)}`,
			};
		});
	}

	function deleteItem() {
		showDeleteConfirm = false;
		echoOps.delete(echoItem.id);
		page('/echo');
	}
</script>
