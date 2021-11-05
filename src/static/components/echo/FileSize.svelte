{#if echoItem.uploading}
	<SpikeSpinner size={SpikeSpinnerSizes.Small} /> Uploading
{:else}
	{bytes(echoItem.size, 'gb')}GB
{/if}

<script lang="ts">
	import SpikeSpinner, { SpikeSpinnerSizes } from '../SpikeSpinner.svelte';
	import { bytes } from '../../../shared/formatters';
	import type { PreparedEchoItem } from '../../../shared/types/echo';

	export let echoItem: PreparedEchoItem;
</script>
