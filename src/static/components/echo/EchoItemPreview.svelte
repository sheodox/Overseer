<style>
    .echo-item {
        max-width: 90vw;
    }
    .echo-item-details {
        border-radius: 3px 0 0 3px;
    }
    p {
        margin: 0;
        color: var(--shdx-text-color);
    }
    .download {
        height: 100%;
        background: var(--shdx-gray-600);
        border-radius: 0 3px 3px 0;
        display: grid;
        place-content: center;
    }
    .download.unavailable {
        color: var(--shdx-gray-900);
    }
</style>

<div class="echo-item f-column">
    {#if variant === 'grid'}
        <EchoImages echoItem={item} mode="view" size="medium" variant="cover" />
    {/if}
    <div class="f-row description">
        <div class="echo-item-details p-4 f-column f-1 card clickable">
            <Link href={item.path} noHoverStyles={true}>
                <p class="shdx-font-size-5 mb-3">{item.name}</p>
                <p>
                    <FileSize echoItem={item} /> - Updated {new Date(item.updatedAt).toLocaleDateString()}
                </p>
            </Link>
        </div>
        <EchoDownloadLink echoItem={item}>
            <div class="download card clickable f-row p-5 shdx-font-size-5">
                <Icon icon="download" />
                <span class="sr-only">Download</span>
            </div>

            <div slot="unavailable" class="download unavailable card f-row p-5 shdx-font-size-5">
                <Icon icon="download" />
            </div>
        </EchoDownloadLink>
    </div>
</div>

<script>
    import {Icon} from 'sheodox-ui';
    import Link from '../Link.svelte';
    import FileSize from "./FileSize.svelte";
    import EchoDownloadLink from "./EchoDownloadLink.svelte";
    import EchoImages from "./EchoImages.svelte";

    export let item;
    //the 'variant' matches a view style on Echo.svelte, whether it's simple data in a list or has images
    export let variant = 'list';
</script>