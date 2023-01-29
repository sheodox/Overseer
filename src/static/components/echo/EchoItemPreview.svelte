<style lang="scss">
	p {
		color: red;
		margin: 0;
		color: var(--sx-text-color);
	}
	.download.unavailable {
		color: var(--sx-gray-900);
	}
	.item-subtitle {
		color: var(--sx-gray-75);
	}

	$corner-radius: 5px;
	.list {
		width: 100%;
	}
	.grid {
		overflow: hidden;

		.download {
			border-radius: 0 0 $corner-radius 0;
		}
		// remove a bit of padding between everything
		:global(.image-container) {
			line-height: 0;
			:global(*) {
				line-height: 0;
			}
		}
	}
</style>

<div class="echo-item f-column {variant} card clickable" class:card-image={variant === EchoViewLayout.Grid}>
	{#if variant === EchoViewLayout.Grid}
		<EchoImages echoItem={item} mode={AlbumMode.View} size={AlbumSize.Medium} variant={AlbumVariant.Cover} />
	{/if}
	<Link href={item.path} noHoverStyles={true}>
		<div class="f-row card-inset">
			<div
				class="echo-item-details p-4 f-row f-1 card clickable justify-content-between align-items-center"
				class:has-image={variant === EchoViewLayout.Grid}
			>
				<div>
					<div class="f-row justify-content-between align-items-top">
						<p class="sx-font-size-5">{item.name}</p>
					</div>
					<p class="item-subtitle">
						<strong><FileSize echoItem={item} /></strong> - Updated {item.updatedAt.toLocaleDateString()}
					</p>
				</div>
				<EchoDownloadLink echoItem={item}>
					<div class="button m-0 primary">
						<Icon icon="download" variant="icon-only" />
						<span class="sr-only">Download</span>
					</div>

					<div slot="unavailable" class="download unavailable">
						<Icon icon="download" />
					</div>
				</EchoDownloadLink>
			</div>
		</div>
	</Link>
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
