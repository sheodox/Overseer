<style>
    h1 {
        font-size: 1.1rem;
        margin: 0 1rem 0 0;
    }
    .centered {
        text-align: center;
    }
    ul {
        list-style: none;
        padding: 0;
    }
</style>

<div class="panel panel-body">
    <div class="f-row justify-content-between align-items-center">
        <h1>Echo - Recent Uploads</h1>
        <Link href="/echo">
            <span class="fw-bold">
                Check out Echo
                <Icon icon="chevron-right" />
            </span>
        </Link>
    </div>

    {#if recentUploads.length}
        <ul>
            {#each recentUploads as item (item.id)}
                <li>
                    <EchoItemPreview {item} />
                </li>
            {/each}
        </ul>
        {#if hiddenUploads > 0}
            <p class="text-align-center">
                {#if hiddenUploads === 1}
                    And one other upload!
                {:else}
                    And {hiddenUploads} other uploads!
                {/if}
            </p>
        {/if}
    {:else if $echoInitialized}
        <p class="centered">Echo has nothing!</p>
    {:else}
        <div class="centered">
            <SpikeSpinner size="medium"/>
        </div>
    {/if}
</div>


<script>
    import {Icon} from 'sheodox-ui';
    import Link from '../Link.svelte';
    import {echoItems, echoInitialized} from '../stores/echo';
    import SpikeSpinner from "../SpikeSpinner.svelte";
    import EchoItemPreview from "./EchoItemPreview.svelte";

    const maxRecentUploads = 10;

    $: recentUploads = $echoItems?.slice().sort((a, b) => {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })
        .slice(0, maxRecentUploads);
    $: hiddenUploads = $echoItems.length - recentUploads.length;
</script>