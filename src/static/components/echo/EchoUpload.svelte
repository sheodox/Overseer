<style>
    .details {
        display: flex;
        flex-direction: row;
    }
    .page-content {
        margin: 1rem;
        padding: 1rem;
    }
    .column {
        margin: 0.2rem;
    }
    textarea {
        width: 100%;
        height: 10rem;
        font-size: 0.9rem;
        resize: vertical;
    }
    input {
        width: 100%;
    }
</style>

<div class="page-content">
    <form on:submit|preventDefault={submit}>
        <h1>{echoItem ? echoItem.name : 'Echo Upload'}</h1>
        <EchoFileSelect bind:file {mode} />
        <div class="details">
            <div class="column f-1">
                <label>
                    Name
                    <br>
                    <input bind:value={name} required />
                </label>
                <br>
                <label>
                    Tags
                    <br>
                    <input bind:value={tags} />
                </label>
                <br>
                <TagCloud bind:tags />
            </div>
            <div class="column f-2">
                <label for="echo-notes">Notes</label>
                <br>
                <textarea id="echo-notes" bind:value={notes}></textarea>
                <p>
                    <Icon icon="info-circle" /> Notes can use markdown!
                </p>
            </div>
        </div>
        <div class="f-row justify-content-end">
            <button disabled={!name || (mode === 'upload' && !file)}>
                {#if mode === 'upload'}
                    <Icon icon="upload" />
                    Upload
                {:else}
                    <Icon icon="save" />
                    {file ? 'Update and upload' : 'Update'}
                {/if}
            </button>
        </div>
    </form>
</div>

<script>
    import {Icon} from 'sheodox-ui';
    import EchoFileSelect from "./EchoFileSelect.svelte";
    import {echoItems, echoOps, submitChanges, submitNewUpload} from "../stores/echo";
    import {pageName} from "../stores/app";
    import {activeRouteParams} from "../stores/routing";
    import page from 'page';
    import TagCloud from "./TagCloud.svelte";

    export let mode; //'edit' | 'upload'

    let name, tags, notes, file;

    pageName.set(mode === 'upload' ? 'Upload' : 'Edit');

    $: suggestName(file?.name);
    $: echoItem = mode === 'edit' ? findItem($echoItems) : null

    let seededEditData = false;

    function findItem() {
        const item = $echoItems.find(({id}) => id === $activeRouteParams.echoId)
        if (!seededEditData && item) {
            name = item.name;
            tags = item.tags;
            notes = item.notes;
            seededEditData = true;
        }
        return item;
    }

    function suggestName(fileName) {
        if (fileName && !name) {
            name = fileName.replace(/\.zip$/, '');
        }
    }

    async function submit() {
        //update the item just so it updates the header
        if (echoItem) {
            echoItem.name = name;
        }

        const redirect = id => page(`/echo/${id}`);

        if (mode === 'upload') {
            redirect(
                await echoOps.upload(null, {
                    name, tags, notes
                }, file)
            );
        } else if (file) {
            await echoOps.upload(echoItem.id, {
                name, tags, notes
            }, file)
            redirect(echoItem.id);
        } else {
            echoOps.update(echoItem.id, {
                name, tags, notes
            });
            redirect(echoItem.id);
        }
    }
</script>