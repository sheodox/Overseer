{#if booker.echo.download && !echoItem.uploading && $echoOnline}
	<!-- [download] only works on same-origin URLs, which the echo server probably isn't,
     so to prevent unwanted unloading of the app (and terminating of the websocket) we need
     to tell it to open in a new tab. -->
	<a on:click|stopPropagation target="_blank" href={`${echoItem.downloadUrl}?token=${$echoDownloadToken}`}>
		<slot />
	</a>
{:else}
	<span>
		<slot name="unavailable" />
	</span>
{/if}

<script lang="ts">
	import { echoOnline, echoDownloadToken } from '../stores/echo';
	import { booker } from '../stores/app';
	import type { PreparedEchoItem } from '../../../shared/types/echo';

	export let echoItem: PreparedEchoItem;
</script>
