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
			<label>
				{label}
				<br />
				{#if type === 'text'}
					<input bind:value use:focus />
				{:else if type === 'textarea'}
					<textarea bind:value use:focus />
				{/if}
			</label>
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

<script>
	import { createEventDispatcher } from 'svelte';
	import { Modal, Icon } from 'sheodox-ui';
	const dispatch = createEventDispatcher();

	export let initialValue = '';
	export let visible;
	export let label;
	export let title;
	export let type = 'text';
	export let hint;

	let value = initialValue;

	function focus(e) {
		e.focus();
	}

	function save() {
		dispatch('save', value);
		visible = false;
	}
</script>
