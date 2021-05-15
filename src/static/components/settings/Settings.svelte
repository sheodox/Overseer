<style>
    .sub-panel {
        background: var(--shdx-gray-500);
        width: 20rem;
        max-width: 95vw;
    }
</style>

<div class="page-content">
    <h1>Settings</h1>
    <h2>Notifications</h2>
    <Checkbox id="push-notifications" bind:checked={$settings.pushNotifications}>
        Send Push Notifications
    </Checkbox>

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
            <Checkbox id="notify-new-events"bind:checked={$settings.notifyNewEvents}>
                New Events
            </Checkbox>

            <Checkbox id="notify-event-reminders" bind:checked={$settings.notifyEventReminders}>
                Event Reminders
            </Checkbox>
        {/if}
        {#if window.Booker.echo.view}
            <Checkbox id="notify-echo-uploads" bind:checked={$settings.notifyEchoUploads}>
                Echo Uploads
            </Checkbox>
        {/if}
        <Checkbox id="notify-site-announcements" bind:checked={$settings.notifySiteAnnouncements}>
            Site Announcements
        </Checkbox>
    </div>
</div>

<script>
    import {Checkbox, Icon} from 'sheodox-ui';
    import {settings, pushSubscribed, pageName} from "../stores/app";
    import PushNotificationSubscribe from "../notifications/PushNotificationSubscribe.svelte";

    $pageName = 'Settings'
</script>