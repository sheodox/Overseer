<style>
    @media (max-width: 1000px) {
        h1 {
            font-size: var(--shdx-font-size-5);
        }
    }
</style>

<div class="f-row justify-content-between align-items-baseline">
    <Link href="{href}">
        <h1 class="m-0">
            {title}
            <Icon icon="chevron-right" />
        </h1>
    </Link>
</div>

<script>
    import {Icon} from 'sheodox-ui';
    import Link from './Link.svelte';

    export let title;
    export let href;
</script>