<style>
    img.minimal, .placeholder.minimal {
        --image-size: 1.3rem;
    }
    img, .placeholder {
        --image-size: 2rem;
        height: var(--image-size);
        width: var(--image-size);
        border-radius: 50%;
        margin-right: 0.2rem;
        background: var(--shdx-bg);
    }
</style>
<div class="user-bubble f-row">
    {#if !matchingUser || matchingUser?.loading}
        <div class="placeholder f-row justify-content-center align-items-center" class:minimal={mode === 'minimal'}>
            <SpikeSpinner size="small" />
        </div>
        {#if mode === 'full'}
            Loading...
        {/if}
    {:else}
        <img src={matchingUser.profileImage} alt={matchingUser.displayName} class:minimal={mode === 'minimal'} title={matchingUser.displayName} />
        <div class="f-column">
            {#if mode === 'full'}
                <span>{matchingUser.displayName}</span>
            {/if}
            <slot />
        </div>
    {/if}
</div>
<script>
    import {requestUser, userRegistry} from "./stores/app";
    import SpikeSpinner from "./SpikeSpinner.svelte";

    export let user;
    export let userId;
    export let mode = 'full'; //'full' | 'minimal'

    $: matchingUser = user ?? $userRegistry[userId];
    $: userId && requestUser(userId);
</script>