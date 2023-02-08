<style>
	.tray {
		width: 20rem;
		max-width: 95vw;
		padding: 0.5rem;
	}
	ul {
		height: 30rem;
		max-height: 50vh;
		overflow: auto;
	}
	h1,
	p {
		margin: 0;
	}
	.time {
		font-size: 0.8rem;
	}
	li :global(a) {
		display: block;
	}
	li {
		border-radius: 5px;
	}
	.unread-indicator {
		color: var(--sx-accent-blue);
		font-size: 0.5rem;
	}
</style>

<div class="tray">
	<div class="toolbar f-row justify-content-between align-items-center">
		<h1>Notifications</h1>
		<button on:click={notificationOps.markAllRead}> Mark All Read </button>
	</div>
	<ul>
		{#each $notifications as notification}
			<li>
				<Link href={notification.href} noHoverStyles={true} on:followed={() => markRead(notification)}>
					<div class="f-row align-items-center">
						{#if !notification.read}
							<div class="unread-indicator">
								<Icon icon="circle" />
							</div>
						{/if}
						<div class="f-column f-1">
							<p class="message">{notification.message}</p>
							<div class="time muted f-row justify-content-between">
								<span>{notification.title}</span>
								<span>{relativeDate(notification.createdAt)} ago</span>
							</div>
						</div>
					</div>
				</Link>
			</li>
		{:else}
			<li>
				<p class="text-align-center">
					<em>No notifications.</em>
				</p>
			</li>
		{/each}
	</ul>
</div>

<script lang="ts">
	import Icon from 'sheodox-ui/Icon.svelte';
	import { notifications, notificationOps } from '../stores/notifications';
	import { relativeDate } from '../../../shared/formatters';
	import type { Notification } from '../../../shared/types/notifications';
	import Link from '../Link.svelte';

	function markRead(notification: Notification) {
		if (!notification.read) {
			notificationOps.markRead(notification.id);
		}
	}
</script>
