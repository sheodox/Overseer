<style>
	input {
		display: none;
	}
	label.disabled {
		background: var(--sx-bg) !important;
		cursor: default;
		color: var(--sx-muted);
	}
	.drop-message,
	.dragging input {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		width: 100vw;
		height: 100vh;
	}
	.drop-message {
		z-index: 9999;
		background: rgba(0, 0, 0, 0.9);
		font-size: 4rem;
	}
	.dragging input {
		z-index: 10000;
		display: block;
		opacity: 0;
	}
</style>

{#if dragging}
	<div class="drop-message f-column justify-content-center align-items-center">
		<p>Drop to attach file!</p>
	</div>
{/if}
<div class:dragging>
	<label class="button secondary" class:disabled={!$echoOnline} title={!$echoOnline ? 'Echo is offline!' : ''}>
		<Icon icon="upload" />
		{mode === EchoUploadMode.Upload ? 'Select a file' : '(Optional) Upload updated file'}
		<input type="file" bind:files accept=".zip" disabled={!$echoOnline} required={mode === EchoUploadMode.Upload} />
	</label>
	<span>
		{#if file}
			Selected:
			<em>
				{file.name}
			</em>
			({bytes(file.size, 'gb')}gb)
		{/if}
	</span>
</div>

<svelte:body
	on:dragover={() => (dragging = true)}
	on:drop={() => (dragging = false)}
	on:mouseleave={() => (dragging = false)}
	on:dragexit={() => (dragging = false)}
/>

<script lang="ts">
	import Icon from 'sheodox-ui/Icon.svelte';
	import { bytes } from '../../../shared/formatters';
	import { echoOnline } from '../stores/echo';
	import { EchoUploadMode } from './EchoUpload.svelte';

	export let mode: EchoUploadMode;
	export let file: File;
	let files: FileList,
		dragging = false;

	$: file = files && files[0];
</script>
