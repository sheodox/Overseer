<style>
    .sub-panel {
        margin: 0.5rem;
    }
    p {
        margin: 0;
    }
</style>

<div class="echo-item sub-panel">
    <Link href={item.path}>
        <p>{item.name}</p>
    </Link>
    <p class="muted">
        <FileSize echoItem={item} /> - Updated {new Date(item.updatedAt).toLocaleDateString()}
    </p>
</div>

<script>
    import Link from '../Link.svelte';
    import FileSize from "./FileSize.svelte";

    export let item;
</script>