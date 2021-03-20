<style>
    @keyframes spin {
        100% {
            transform: rotate(360deg);
        }
    }
    .large {
        --spike-size: 3rem;
    }
    .small {
        --spike-size: 0.3rem;
    }
    .spikes {
        --spike-drift: calc(3 * var(--spike-size));
        display: inline-block;
        position: relative;
        animation: spin 1s infinite linear;
        height: var(--spike-drift);
        width: var(--spike-drift);
    }
    .spike {
        background: white;
        height: var(--spike-size);
        width: var(--spike-size);
        clip-path: polygon(50% 7.19875%, 0 92.80125%, 100% 92.80125%);
    }
    .spike-box {
        height: var(--spike-drift);
        position: absolute;
        left: 50%;
        transform-origin: left;
    }
    .spike1 {
        transform: translateX(-50%);
    }
    .spike2 {
        transform: rotate(120deg) translateX(-50%);
    }
    .spike3 {
        transform: rotate(240deg) translateX(-50%);
    }
</style>

<div class="spikes {size}">
    <div class="spike-box spike1">
        <div class="spike"></div>
    </div>
    <div class="spike-box spike2">
        <div class="spike"></div>
    </div>
    <div class="spike-box spike3">
        <div class="spike"></div>
    </div>
</div>

<script>
    export let size = 'small';
</script>