<div class="panel p-3">
	<form on:submit|preventDefault={createAnnouncement} class="f-column">
		<label>
			Title
			<br />
			<input bind:value={title} />
		</label>
		<label>
			Message
			<br />
			<input bind:value={message} />
		</label>
		<label>
			Link
			<br />
			<input bind:value={href} />
		</label>
		<button disabled={!valid}>
			<Icon icon="paper-plane" />
			Send
		</button>
	</form>
</div>

<script lang="ts">
	import Icon from 'sheodox-ui/Icon.svelte';
	import { adminEnvoy } from './admin-common';

	let title: string, message: string, href: string;
	resetFields();

	function resetFields() {
		title = 'Announcement';
		message = '';
		href = '/';
	}

	$: valid = title && message && href;

	function createAnnouncement() {
		adminEnvoy.emit('create-announcement', title, message, href);
		resetFields();
	}
</script>
