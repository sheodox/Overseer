<style>
    .attendee-list {
        margin: 0.2rem;
        max-width: 15rem;
        padding: 0.5rem;
    }
    .user {
        margin: 0.2rem;
    }
    h3 {
        margin: 0;
    }
</style>

{#if rsvps.length || showEmpty}
    <div class="attendee-list sub-panel">
        <h3>{title}<slot /></h3>
        {#if rsvps.length}
            <small>{rsvps.length} {rsvps.length === 1 ? 'person' : 'people'}</small>
        {/if}
        <div>
            {#each rsvps as rsvp}
                <div class="user">
                    <UserBubble userId={rsvp.userId} />
                </div>
            {:else}
                <p class="text-align-center"><em>No RSPVs.</em></p>
            {/each}
        </div>
    </div>
{/if}

<script>
    import UserBubble from '../UserBubble.svelte';

    export let title = '';
    export let rsvps = [];
    export let showEmpty = false; //render even if there are no RSVPS to show, will show a "blank" message
</script>