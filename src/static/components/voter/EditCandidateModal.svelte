<style>
	input {
		width: 100%;
	}
	textarea {
		width: 100%;
		height: 10rem;
		font-size: 0.9rem;
	}
	.images {
		max-width: 100%;
		width: 35rem;
		max-height: 20rem;
		overflow-y: auto;
	}
</style>

<Modal bind:visible title="Edit {candidate.name}">
	<div class="modal-body">
		<label>
			Name
			<br />
			<input bind:value={name} />
		</label>
		<br />
		<label>
			Notes
			<br />
			<textarea bind:value={notes} on:paste={notesPaste} />
		</label>
		<p>
			<Icon icon="info-circle" />
			You can use markdown in notes!
			{#if window.Booker.voter.add_image}
				Paste into notes to attach images.
			{/if}
		</p>

		{#if window.Booker.voter.remove_image}
			<div class="images">
				<CandidateImages mode="edit" {candidateImages} {candidate} on:delete={deleteImage} />
			</div>
		{/if}
	</div>
	<div class="modal-footer">
		<button on:click={() => (visible = false)}>Cancel</button>
		<button on:click={save} disabled={name === candidate.name && notes === candidate.notes} class="primary">
			<Icon icon="save" />
			Save
		</button>
	</div>
</Modal>

<script>
	import { Modal, Icon, createAutoExpireToast } from 'sheodox-ui';
	import { voterOps } from '../stores/voter';
	import CandidateImages from './CandidateImages.svelte';

	export let candidate;
	export let candidateImages;
	export let visible;

	let name = candidate.name;
	let notes = candidate.notes;

	function save() {
		voterOps.candidate.update(candidate.id, name, notes);
		visible = false;
	}

	function notesPaste(e) {
		const file = e.clipboardData.files[0];
		if (file && window.Booker.voter.add_image) {
			e.preventDefault();
			if (['image/png', 'image/jpeg'].includes(file.type)) {
				voterOps.candidate.uploadImage(candidate.id, file);
			} else {
				createAutoExpireToast({
					variant: 'error',
					title: 'Upload Error',
					messsage: 'Invalid file type!',
				});
			}
		}
	}

	function deleteImage(e) {
		if (confirm('Are you sure you want to delete this image?')) {
			voterOps.candidate.deleteImage(e.detail);
		}
	}
</script>
