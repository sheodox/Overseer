<style>
    img.minimal {
        --image-size: 1.3rem;
    }
    img {
        --image-size: 2rem;
        height: var(--image-size);
        width: var(--image-size);
        border-radius: 50%;
        margin-right: 0.2rem;
    }
</style>
<div class="user-bubble f-row">
    <img src={user.profileImage} alt={user.displayName} class:minimal={mode === 'minimal'} title={user.displayName} />
    <div class="f-column">
        {#if mode === 'full'}
            <span>{user.displayName}</span>
        {/if}
        <slot />
    </div>
</div>
<script>
    export let user = {};
    export let mode = 'full'; //'full' | 'minimal'
</script>