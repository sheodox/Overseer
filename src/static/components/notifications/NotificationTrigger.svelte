<style>
	.has-unread {
		color: var(--sx-accent-blue);
	}
</style>

<li>
	<NavDropdown showOpenIcon={false}>
		<span slot="button" class:has-unread={$unreadNotificationCount}>
			<Icon icon="bell" />
			<span class="sr-only">Notifications</span>
		</span>
		<div slot="menu">
			<NotificationTray />
		</div>
	</NavDropdown>
</li>

<script lang="ts">
	import Icon from 'sheodox-ui/Icon.svelte';
	import NavDropdown from 'sheodox-ui/NavDropdown.svelte';
	import { unreadNotificationCount } from '../stores/notifications';
	import NotificationTray from './NotificationTray.svelte';
</script>
