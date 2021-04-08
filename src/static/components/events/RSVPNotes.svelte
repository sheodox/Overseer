<style>
    .rsvp-notes {
        max-width: 15rem;
        margin: 0.2rem;
    }
</style>

{#if rsvps.length}
    <div>
        <h2>Notes for the organizer</h2>
        <div class="f-row f-wrap">
            {#each rsvps as rsvp}
                {#if rsvp.notes}
                    <div class="rsvp-notes sub-panel">
                        <div>
                            <UserBubble userId={rsvp.userId}>
                                <span>
                                    <RSVPStatus status={rsvp.status} />
                                </span>
                            </UserBubble>
                        </div>
                        <p>{rsvp.notes}</p>
                    </div>
                {/if}
            {/each}
            {#if !hasNotes}
                <p><em>Nobody left any notes.</em></p>
            {/if}
        </div>
    </div>
{/if}

<script>
    import UserBubble from "../UserBubble.svelte";
    import RSVPStatus from "./RSVPStatus.svelte";

    export let rsvps;
    $: hasNotes = rsvps.some(({notes}) => !!notes)
</script>