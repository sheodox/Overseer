<style>
	textarea {
		width: 30rem;
		height: 15rem;
		font-size: 0.8rem;
	}
</style>

<Modal bind:visible {title}>
	<form on:submit|preventDefault={save}>
		<div class="modal-body">
			<!-- svelte-ignore a11y-label-has-associated-control -->
			{#if type === 'text'}
				<TextInput autofocus bind:value>{label}</TextInput>
			{:else if type === 'textarea'}
				<label>
					{label}
					<br />
					<textarea bind:value use:focus />
				</label>
			{/if}
			{#if hint}
				<p><Icon icon="info-circle" /> {hint}</p>
			{/if}
		</div>
		<div class="modal-footer">
			<button type="button" on:click={() => (visible = false)}>Cancel</button>
			<button class="primary"><Icon icon="save" />Save</button>
		</div>
	</form>
</Modal>

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Icon, Modal, TextInput } from 'sheodox-ui';
	const dispatch = createEventDispatcher();

	export let initialValue = '';
	export let visible: boolean;
	export let label: string;
	export let title: string;
	export let type = 'text';
	export let hint = '';

	let value = initialValue;

	function focus(e: HTMLInputElement | HTMLTextAreaElement) {
		e.focus();
	}

	function save() {
		dispatch('save', value);
		visible = false;
	}
</script>
