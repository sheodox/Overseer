<style>
    .centered {
        text-align: center;
    }
    ul {
        list-style: none;
    }
</style>

<div>
    <HomePageAppTitle title="Recent Echo Uploads" href="/echo" />

    {#if recentUploads.length}
        <ul class="f-column gap-3 m-0 p-0">
            {#each recentUploads as item (item.id)}
                <li>
                    <EchoItemPreview {item} />
                </li>
            {/each}
        </ul>
        {#if hiddenUploads > 0}
            <p class="text-align-center">
                <Link href="/echo">
                    {#if hiddenUploads === 1}
                        And one other upload!
                    {:else}
                        And {hiddenUploads} other uploads!
                    {/if}
                </Link>
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
    import HomePageAppTitle from "../HomePageAppTitle.svelte";

    const maxRecentUploads = 10;

    $: recentUploads = $echoItems?.slice().sort((a, b) => {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    })
        .slice(0, maxRecentUploads);
    $: hiddenUploads = $echoItems.length - recentUploads.length;
</script>