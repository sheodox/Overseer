<style>
	.panel {
		width: 30rem;
		max-width: 95vw;
		overflow: auto;
	}
	#token-copy-input {
		flex: 1;
	}
	fieldset {
		margin: 1rem;
	}
</style>

<div class="f-column panel p-3">
	{#if token}
		<label for="token-copy-input"> Token </label>
		<div class="input-group">
			<input id="token-copy-input" value={token} bind:this={tokenInput} />
			<button on:click={copyToken}>
				<Icon icon="copy" />
				Copy
			</button>
		</div>
		<br />
		<button on:click={() => (token = '')}> Generate Another </button>
	{:else}
		<label>
			Service Name
			<br />
			<input bind:value={name} />
		</label>
		<fieldset>
			<legend>Scopes</legend>
			<div class="f-row f-wrap">
				{#each availableScopes as scope}
					<label>
						<input type="checkbox" bind:group={scopes} value={scope} />
						{scope}
					</label>
				{/each}
			</div>
		</fieldset>
		<button on:click={generate}> Generate Token </button>
	{/if}
</div>

<script lang="ts">
	import Icon from 'sheodox-ui/Icon.svelte';
	import { adminEnvoy } from './admin-common';

	const availableScopes = ['echo', 'voter', 'logs'] as const;
	let name = '',
		token = '',
		scopes: [] | typeof availableScopes[number] = [],
		tokenInput: HTMLInputElement;

	function generate() {
		adminEnvoy.emit('generate-integration-token', name, scopes, (tkn: string) => {
			//if they didn't fill out everything they won't get a token back
			if (tkn) {
				token = tkn;
				name = '';
				scopes = [];
			}
		});
	}
	function copyToken() {
		tokenInput.select();
		document.execCommand('copy');
	}
</script>
