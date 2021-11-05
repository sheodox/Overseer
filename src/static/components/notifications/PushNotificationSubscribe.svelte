<button on:click={pushSubscribe} class="primary">
	<Icon icon="bell" />
	Get Notifications
</button>

<script lang="ts">
	import Icon from 'sheodox-ui/Icon.svelte';
	import { pushSubscribed, storePushEndpoint, appBootstrap } from '../stores/app';
	import { notificationOps } from '../stores/notifications';

	async function pushSubscribe() {
		const sw = await navigator.serviceWorker.ready,
			push = await sw.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: appBootstrap.serverMetadata.pushVapidPublicKey,
			});

		storePushEndpoint(push);

		notificationOps.registerPushSubscription(JSON.parse(JSON.stringify(push)));
		$pushSubscribed = true;
	}
</script>
