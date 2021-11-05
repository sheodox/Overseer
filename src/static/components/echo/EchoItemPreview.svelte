<style>
	.echo-item {
		max-width: 90vw;
	}
	.description {
		border-radius: 3px;
	}
	p {
		color: red;
		margin: 0;
		color: var(--shdx-text-color);
	}
	.download {
		height: 100%;
		background: var(--shdx-gray-600);
		display: grid;
		place-content: center;
	}
	.download.unavailable {
		color: var(--shdx-gray-900);
	}
</style>

<div class="echo-item f-column">
	{#if variant === EchoViewLayout.Grid}
		<EchoImages echoItem={item} mode={AlbumMode.View} size={AlbumSize.Medium} variant={AlbumVariant.Cover} />
	{/if}
	<div class="f-row description">
		<div class="echo-item-details p-4 f-column f-1 card clickable" class:has-image={variant === EchoViewLayout.Grid}>
			<Link href={item.path} noHoverStyles={true}>
				<p class="shdx-font-size-5 mb-3">{item.name}</p>
				<p>
					<FileSize echoItem={item} /> - Updated {new Date(item.updatedAt).toLocaleDateString()}
				</p>
			</Link>
		</div>
		<EchoDownloadLink echoItem={item}>
			<div class="download card clickable f-row p-5 shdx-font-size-5">
				<Icon icon="download" />
				<span class="sr-only">Download</span>
			</div>

			<div slot="unavailable" class="download unavailable card f-row p-5 shdx-font-size-5">
				<Icon icon="download" />
			</div>
		</EchoDownloadLink>
	</div>
</div>

<script lang="ts">
	import Icon from 'sheodox-ui/Icon.svelte';
	import Link from '../Link.svelte';
	import FileSize from './FileSize.svelte';
	import EchoDownloadLink from './EchoDownloadLink.svelte';
	import EchoImages from './EchoImages.svelte';
	import { EchoViewLayout } from './Echo.svelte';
	import { AlbumMode, AlbumSize, AlbumVariant } from '../image/Album.svelte';
	import type { PreparedEchoItem } from '../../../shared/types/echo';

	export let item: PreparedEchoItem;
	export let variant: EchoViewLayout = EchoViewLayout.List;
</script>
