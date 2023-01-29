<style>
	.sub-panel {
		background: var(--sx-gray-500);
		width: 20rem;
		max-width: 95vw;
	}
</style>

<div class="page-content">
	<h1>Settings</h1>
	<h2>Notifications</h2>
	<Checkbox id="push-notifications" bind:checked={$settings.pushNotifications}>Send Push Notifications</Checkbox>

	<div class="sub-panel mx-0 p-4">
		<h3 class="mt-0">Push Permissions</h3>
		{#if $pushSubscribed}
			<div class="f-row align-items-center gap-2">
				<div class="sx-font-size-5">
					<Icon icon="circle-check" />
				</div>
				<p>You're set up to get push notifications on this device!</p>
			</div>
		{:else}
			<div class="f-row align-items-center gap-2">
				<div class="sx-font-size-5">
					<Icon icon="circle-xmark" />
				</div>
				<p>You're not set up to get push notifications on this device.</p>
			</div>
			<PushNotificationSubscribe />
			<p>
				<small class="mb-0">
					<Icon icon="info-circle" />This must be set up on every device you want to get push notifications.
				</small>
			</p>
		{/if}
	</div>

	<h2>Desired Notifications</h2>
	<div class="f-column">
		{#if booker.events.view}
			<Checkbox id="notify-new-events" bind:checked={$settings.notifyNewEvents}>New Events</Checkbox>

			<Checkbox id="notify-event-reminders" bind:checked={$settings.notifyEventReminders}>Event Reminders</Checkbox>
		{/if}
		{#if booker.echo.view}
			<Checkbox id="notify-echo-uploads" bind:checked={$settings.notifyEchoUploads}>Echo Uploads</Checkbox>
		{/if}
		<Checkbox id="notify-site-announcements" bind:checked={$settings.notifySiteAnnouncements}>
			Site Announcements
		</Checkbox>
	</div>
</div>

<script lang="ts">
	import Checkbox from 'sheodox-ui/Checkbox.svelte';
	import Icon from 'sheodox-ui/Icon.svelte';
	import { settings, pushSubscribed, pageName, booker } from '../stores/app';
	import PushNotificationSubscribe from '../notifications/PushNotificationSubscribe.svelte';

	$pageName = 'Settings';
</script>
