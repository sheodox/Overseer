<style>
    h1 {
        margin: 0;
    }
    @media (max-width: 800px) {
        .details {
            flex-direction: column;
        }
    }
    .page-content {
        margin: 1rem;
        padding: 1rem;
    }
    .details {
        display: flex;
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
                <textarea id="echo-notes" bind:value={notes} on:paste={notesPaste} ></textarea>
                <p>
                    <Icon icon="info-circle" /> Notes can use markdown!
                    {#if window.Booker.echo.add_image}
                        {mode === 'edit' ? 'You can add images by pasting them into the Notes box.' : 'You can attach images after starting the upload.'}
                    {/if}
                </p>
            </div>
        </div>
        <div class="f-row justify-content-end">
            {#if echoItem}
                <Link href={echoItem.path}>
                    <span class="button">
                        <Icon icon="chevron-left" />
                        Back
                    </span>
                </Link>
            {/if}
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

    {#if echoItem && window.Booker.echo.remove_image}
        <EchoImages {echoItem} mode="edit" on:delete={deleteImage} />
    {/if}
</div>

<script>
    import {createAutoExpireToast, Icon} from 'sheodox-ui';
    import EchoFileSelect from "./EchoFileSelect.svelte";
    import {echoItems, echoOps} from "../stores/echo";
    import {pageName} from "../stores/app";
    import {activeRouteParams} from "../stores/routing";
    import page from 'page';
    import TagCloud from "./TagCloud.svelte";
    import EchoImages from "./EchoImages.svelte";
    import Link from "../Link.svelte";

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

    function notesPaste(e) {
        // can't attach images until an item is created currently, you need an ID to attach them.
        // this can be changed in the future
        if (!echoItem) {
            return;
        }

        const file = e.clipboardData.files[0];
        if (file && window.Booker.echo.add_image) {
            e.preventDefault();
            if (['image/png', 'image/jpeg'].includes(file.type)) {
                echoOps.uploadImage(echoItem.id, file);
            } else {
                createAutoExpireToast({
                    variant: 'error',
                    title: 'Upload Error',
                    messsage: 'Invalid file type!',
                });
            }
        }
    }

    function deleteImage(e) {
        if (confirm('Are you sure you want to delete this image?')) {
            echoOps.deleteImage(e.detail);
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