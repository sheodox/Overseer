<style>
	.status.normal {
		border-radius: 5px;
		font-weight: bold;
		padding: var(--sx-spacing-1) var(--sx-spacing-2);
	}
	.status.minimal {
		border-radius: 50%;
		width: 1.25rem;
		height: 1.25rem;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.status-going {
		background-color: var(--sx-green-400);
		color: var(--sx-green-900);
	}
	.status-maybe {
		background-color: var(--sx-purple-300);
		color: var(--sx-purple-900);
	}
	.status-not-going {
		background-color: var(--sx-red-300);
		color: var(--sx-red-900);
	}
</style>

<div class="status status-{status} {variant} m-0">
	{#if status === 'going'}
		<Icon icon="check" variant={iconVariant} />
		<span class:sr-only={variant === 'minimal'}> Going </span>
	{:else if status === 'not-going'}
		<Icon icon="calendar-times" variant={iconVariant} />
		<span class:sr-only={variant === 'minimal'}> Not Going </span>
	{:else if status === 'maybe'}
		<Icon icon="question" variant={iconVariant} />
		<span class:sr-only={variant === 'minimal'}> Maybe </span>
	{/if}
</div>

<script lang="ts">
	import Icon from 'sheodox-ui/Icon.svelte';

	export let status: string = null;
	export let variant: 'minimal' | 'normal' = 'normal';

	let iconVariant: 'icon-only' | 'prepend';
	$: iconVariant = variant === 'minimal' ? 'icon-only' : 'prepend';
</script>
