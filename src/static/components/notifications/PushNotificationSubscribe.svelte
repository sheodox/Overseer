<button on:click={pushSubscribe}>
    <Icon icon="bell" />
    Get Notifications
</button>

<script>
    import {Icon} from 'sheodox-ui';
    import {pushSubscribed} from "../stores/app";
    import {notificationOps} from "../stores/notifications";

    async function pushSubscribe() {
        const sw = await navigator.serviceWorker.ready,
            push = await sw.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: window.serverMetadata.pushVapidPublicKey
            })

        notificationOps.registerPushSubscription(JSON.parse(JSON.stringify(push)));
        $pushSubscribed = true;
    }
</script>