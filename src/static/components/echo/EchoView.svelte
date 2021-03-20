<style>
    .panel {
        margin: 1rem;
        padding: 1rem;
    }
    .notes {
        white-space: pre-line;
    }
    ul button {
        width: 8rem;
    }
    .tag {
        margin: 0.2rem;
    }
    .viewer {
        width: 50rem;
        max-width: 95%;
    }
    .partially-hidden {
        transition: max-width 0.6s;
        overflow: hidden;
        white-space: nowrap;
    }
    .partially-hidden:not(:hover) {
        opacity: 0.2;
        max-width: 1rem;
    }
    .partially-hidden:hover {
        opacity: 1;
        max-width: 100%;
        margin-right: 1rem;
    }
</style>

{#if !echoItem && $echoInitialized}
    <p>Couldn't find an upload for this ID, did it get deleted?</p>
    <p><Link href="/echo">Back to the uplaod list.</Link></p>
{:else if echoItem}
    <div class="panel bordered viewer">
        <div class="f-row justify-content-between align-items-center">
            <h1>{echoItem.name}</h1>
            <MenuButton>
                <span slot="trigger">
                    Menu
                    <Icon icon="chevron-down" />
                </span>
                <ul slot="menu">
                    <li>
                        <a class="button" href={echoItem.editPath} on:click|preventDefault={() => page(echoItem.editPath)}>
                            <Icon icon="edit" />
                            Edit
                        </a>
                    </li>
                    <li>
                        <button on:click={() => showDeleteConfirm = true}>
                            <Icon icon="trash" />
                            Delete
                        </button>
                    </li>
                </ul>
            </MenuButton>
        </div>
        <div class="f-row">
            <div class:partially-hidden={hasBeenUpdated}>
                <UserBubble user={echoItem.initialUploader}>
                    <em>Added {new Date(echoItem.createdAt).toLocaleDateString()}</em>
                </UserBubble>
            </div>

            {#if hasBeenUpdated}
                <UserBubble user={echoItem.lastUploader}>
                    <em>Updated {new Date(echoItem.updatedAt).toLocaleDateString()}</em>
                </UserBubble>
            {/if}
        </div>
        <div class="f-row justify-content-between">
            <span>
                {#each tags as tag}
                    <a href={tag.path} on:click|preventDefault={() => page(tag.path)} class="tag">{tag.text}</a>
                {/each}
            </span>
        </div>
        <p class="notes">
            {@html echoItem.notesRendered}
        </p>
        {#if window.Booker.echo.download && !echoItem.uploading && $echoOnline}
            <!-- [download] only works on same-origin URLs, which the echo server probably isn't,
             so to prevent unwanted unloading of the app (and terminating of the websocket) we need
             to tell it to open in a new tab. -->
            <a target="_blank" href={`${echoItem.downloadUrl}?token=${$echoDownloadToken}`} class="fw-bold">
                <Icon icon="download" />
                Download
                (<FileSize {echoItem} />)
            </a>
        {/if}
    </div>
{/if}

{#if showDeleteConfirm}
    <Modal bind:visible={showDeleteConfirm} title="Delete?">
        <div class="modal-body">
            <p>Are you sure you want to delete <em>{echoItem.name}?</em></p>
        </div>
        <div class="modal-footer">
            <button on:click={() => showDeleteConfirm = false}>
                Cancel
            </button>
            <button on:click={deleteItem} class="danger">
                <Icon icon="trash" />
                Delete
            </button>
        </div>
    </Modal>
{/if}

<script>
    import page from 'page';
    import {Icon, MenuButton, Modal} from 'sheodox-ui';
    import {pageName} from "../stores/app";
    import {activeRouteParams} from "../stores/routing";
    import {echoInitialized, echoItems, echoDownloadToken, echoOnline, echoOps} from "../stores/echo";
    import FileSize from "./FileSize.svelte";
    import UserBubble from "../UserBubble.svelte";
    import Link from "../Link.svelte";

    let showDeleteConfirm = false;

    $: echoItem = $echoItems.find(({id}) => id === $activeRouteParams.echoId);
    $: tags = processTags(echoItem?.tags);
    $: hasBeenUpdated = echoItem?.updatedAt !== echoItem?.createdAt;

    $: pageName.set(echoItem?.name);

    function processTags(tags) {
        return (tags?.split(', ') || []).map(tag => {
            return {
                text: tag,
                path: `/echo?search=${encodeURIComponent(tag)}`
            }
        })
    }

    function deleteItem() {
        showDeleteConfirm = false;
        echoOps.delete(echoItem.id);
        page('/echo');
    }
</script>