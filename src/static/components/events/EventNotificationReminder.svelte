<div class="sub-panel">
    <p>
        Want to be notified of future events?
    </p>
    <p>
        You can pick what notifications you receive in the <Link href="/settings">settings</Link>.
    </p>
    <div class="f-row justify-content-between">
        <button on:click={dontPromptAgain}>
            No, Don't Ask Again
        </button>
        <PushNotificationSubscribe />
    </div>
</div>

<script>
    import {createEventDispatcher} from 'svelte';
    import {Icon} from 'sheodox-ui';
    import PushNotificationSubscribe from "../notifications/PushNotificationSubscribe.svelte";
    import Link from "../Link.svelte";
    const dispatch = createEventDispatcher();

    function dontPromptAgain() {
        localStorage.setItem('dont-prompt-event-notifications', 'true');
        dispatch('refused');
    }
</script>