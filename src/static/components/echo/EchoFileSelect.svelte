<style>
    input {
        display: none;
    }
    label.disabled {
        background: var(--bg) !important;
        cursor: default;
        color: var(--muted);
    }
</style>

<div>
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

<script>
    import {Icon} from 'sheodox-ui';
    import {bytes} from "../../../shared/formatters";
    import {echoOnline} from "../stores/echo";

    export let mode; // 'upload' | 'edit', EchoUpload's "mode"
    export let file;
    let files = [];

    $: file = files[0];
    $: console.log(file);
</script>