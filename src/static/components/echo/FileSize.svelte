<style>
</style>

{#if echoItem.uploading}
	<SpikeSpinner size="small" /> Uploading
{:else}
	{bytes(echoItem.size, 'gb')}GB
{/if}

<script>
	import SpikeSpinner from '../SpikeSpinner.svelte';
	import { bytes } from '../../../shared/formatters';

	export let echoItem;
</script>
