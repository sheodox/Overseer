<style>
    .sub-panel {
        margin: 0.5rem;
    }
    p {
        margin: 0;
    }
    .download {
        padding: 0.5rem;
    }
</style>

<div class="echo-item sub-panel">
    <div class="f-row">
        <div class="f-column f-1">
            <Link href={item.path}>
                <p>{item.name}</p>
            </Link>
            <p class="muted">
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

<script>
    import {Icon} from 'sheodox-ui';
    import Link from '../Link.svelte';
    import FileSize from "./FileSize.svelte";
    import EchoDownloadLink from "./EchoDownloadLink.svelte";

    export let item;
</script>