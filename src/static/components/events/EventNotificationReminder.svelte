<style>
	.sub-panel {
		width: 30rem;
		max-width: 90vw;
		background: var(--sx-gray-transparent);
	}
	h1 {
		margin: 0;
	}
</style>

{#if !$pushSubscribed && !dontWantReminders}
	<div class="sub-panel">
		<h1>Notifications</h1>
		<p>Want to be notified of future events?</p>
		<p class="has-inline-links">
			You can pick what notifications you receive in <Link href="/settings">settings</Link>.
		</p>
		<div class="f-row justify-content-between">
			<button on:click={dontPromptAgain} class="secondary"> No, Don't Ask Again </button>
			<PushNotificationSubscribe />
		</div>
	</div>
{/if}

<script lang="ts">
	import { pushSubscribed } from '../stores/app';
	import PushNotificationSubscribe from '../notifications/PushNotificationSubscribe.svelte';
	import Link from '../Link.svelte';

	let dontWantReminders = localStorage.getItem('dont-prompt-event-notifications') === 'true';

	function dontPromptAgain() {
		localStorage.setItem('dont-prompt-event-notifications', 'true');
		dontWantReminders = true;
	}
</script>
