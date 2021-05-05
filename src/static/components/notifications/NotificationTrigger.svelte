<style>
    .has-unread {
        color: var(--shdx-accent-blue);
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

<script>
    import {Icon, NavDropdown} from 'sheodox-ui';
    import {notifications, unreadNotificationCount} from "../stores/notifications";
    import NotificationTray from "./NotificationTray.svelte";

</script>