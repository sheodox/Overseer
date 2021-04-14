<style>

</style>

<li>
    <NavDropdown showOpenIcon={false}>
    <span slot="button">
        <Icon icon="bell" />
        <span class="sr-only">Notifications</span>
        <span class="unread-count">
            {$unreadNotificationCount}
        </span>
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