<style>
    .up {
        background: var(--accent-blue);
    }
    .down {
        background: var(--accent-red);
    }
    .voters {
        position: absolute;
        bottom: 0.2rem;
    }
    .vote-count {
        padding: 0 0.2rem;
    }
</style>

{#if votePercent > 0}
    <div class="f-row {direction}" style="width: {votePercent}%">
        <div class="voters f-row">
            <span class="vote-count fw-bold">{votes}</span>
            {#each voters as user}
                <UserBubble {user} mode="minimal" />
            {/each}
        </div>
    </div>
{/if}

<script>
    import UserBubble from '../UserBubble.svelte';
    export let direction;
    export let votePercent;
    export let voters;

    $: votes = voters.length;
</script>