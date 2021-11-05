<style>
	div {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		z-index: 1000000;
	}
</style>

<div transition:fade class="f-column f-1 justify-content-center align-items-center">
	<SpikeSpinner size={SpikeSpinnerSizes.Large} />
</div>

<script lang="ts">
	import SpikeSpinner, { SpikeSpinnerSizes } from './SpikeSpinner.svelte';
	import { fade } from 'svelte/transition';
</script>
