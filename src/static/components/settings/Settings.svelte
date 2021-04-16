<style>
    .sub-panel {
        width: 20rem;
        max-width: 95vw;
    }
</style>

<div class="page-content">
    <h1>Settings</h1>
    <h2>Notifications</h2>
    <label>
        <input type="checkbox" bind:checked={$settings.pushNotifications}>
        Send Push Notifications
    </label>

    <div class="sub-panel">
        <h3>Push Permissions</h3>
        {#if $pushSubscribed}
            <p>You're set up to get push notifications on this device!</p>
        {:else}
            <p><em>You're not set up to get push notifications on this device.</em></p>
            <PushNotificationSubscribe />
            <p><Icon icon="info-circle" />This must be set up on every device you want to get push notifications.</p>
        {/if}
    </div>

    <h2>Desired Notifications</h2>
    <div class="f-column">
        {#if window.Booker.events.view}
            <label>
                <input type="checkbox" bind:checked={$settings.notifyNewEvents}>
                New Events
            </label>

            <label>
                <input type="checkbox" bind:checked={$settings.notifyEventReminders}>
                Event Reminders
            </label>
        {/if}
        {#if window.Booker.echo.view}
            <label>
                <input type="checkbox" bind:checked={$settings.notifyEchoUploads}>
                Echo Uploads
            </label>
        {/if}
        <label>
            <input type="checkbox" bind:checked={$settings.notifySiteAnnouncements}>
            Site Announcements
        </label>
    </div>
</div>

<script>
    import {Icon} from 'sheodox-ui';
    import {settings, pushSubscribed, pageName} from "../stores/app";
    import PushNotificationSubscribe from "../notifications/PushNotificationSubscribe.svelte";

    $pageName = 'Settings'
</script>