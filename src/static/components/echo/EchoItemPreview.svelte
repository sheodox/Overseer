<style>
    .sub-panel {
        margin: 0.5rem;
        padding: 0;
        overflow: hidden;
        max-width: 90vw;
        color: white;
    }
    .sub-panel:hover {
        background: var(--shdx-sub-panel-bg-light);
    }
    p {
        margin: 0;
    }
    .download {
        padding: 0.5rem;
    }
    .description {
        padding: 0.5rem;
    }
</style>

<div class="echo-item">
    <Link href={item.path} noHoverStyles={true}>
        <div class="sub-panel f-column">
            {#if variant === 'grid'}
                <EchoImages echoItem={item} mode="view" size="medium" variant="cover" />
            {/if}
            <div class="f-row description">
                <div class="f-column f-1">
                    <p class="fw-bold">{item.name}</p>
                    <p>
                        <FileSize echoItem={item} /> - Updated {new Date(item.updatedAt).toLocaleDateString()}
                    </p>
                </div>
                <EchoDownloadLink echoItem={item}>
                    <div class="download">
                        <Icon icon="download" />
                        <span class="sr-only">Download</span>
                    </div>
                </EchoDownloadLink>
            </div>
        </div>
    </Link>
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