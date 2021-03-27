<style>
    input {
        display: none;
    }
    label.disabled {
        background: var(--bg) !important;
        cursor: default;
        color: var(--muted);
    }
    .drop-message, .dragging input {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100vw;
        height: 100vh;
    }
    .drop-message {
        z-index: 9999;
        background: rgba(0, 0, 0, 0.9);
        font-size: 4rem;
    }
    .dragging input {
        z-index: 10000;
        display: block;
        opacity: 0;
    }
</style>

{#if dragging}
    <div class="drop-message f-column justify-content-center align-items-center">
        <p>Drop to attach file!</p>
    </div>
{/if}
<div class:dragging={dragging}>
    <label class="button" class:disabled={!$echoOnline} title={!$echoOnline ? 'Echo is offline!' : ''}>
        <Icon icon="upload" />
        {mode === 'upload' ? 'Select a file' : '(Optional) Upload updated file'}
        <input type="file" bind:files accept=".zip" disabled={!$echoOnline} required={mode === 'upload'}/>
    </label>
    <span>
        {#if file}
            Selected:
            <em>
                {file.name}
            </em>
            ({bytes(file.size, 'gb')}gb)
        {/if}
    </span>
</div>

<svelte:body
    on:dragover={() => dragging = true}
    on:drop={() => dragging = false}
    on:mouseleave={() => dragging = false}
    on:dragexit={() => dragging = false}
/>

<script>
    import {Icon} from 'sheodox-ui';
    import {bytes} from "../../../shared/formatters";
    import {echoOnline} from "../stores/echo";

    export let mode; // 'upload' | 'edit', EchoUpload's "mode"
    export let file;
    let files = [],
        dragging = false;

    $: file = files[0];
</script>