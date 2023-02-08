<style lang="scss">
	img.minimal,
	.placeholder.minimal {
		--image-size: 1.3rem;
		margin: 0;
	}
	img,
	.placeholder {
		--image-size: 2.5rem;
		height: var(--image-size);
		width: var(--image-size);
		border-radius: 50%;
		margin-right: 0.2rem;
		background: var(--sx-bg);
	}
	.mode-minimal:hover {
		background-color: var(--sx-gray-800);
		border-radius: 10px;
		.display-name {
			padding-right: var(--sx-spacing-2);
		}
	}
	.mode-minimal:not(:hover) {
		.display-name {
			display: none;
			margin: 0;
		}
	}
</style>

<div class="user-bubble f-row align-items-center mode-{mode}">
	{#if !matchingUser || matchingUser?.loading}
		<div class="placeholder f-row justify-content-center align-items-center" class:minimal={mode === 'minimal'}>
			<SpikeSpinner size="small" />
		</div>
		{#if mode === 'full'}
			Loading...
		{/if}
	{:else if matchingUser.loading === false}
		<img
			src={matchingUser.profileImage}
			alt={matchingUser.displayName}
			class:minimal={mode === 'minimal'}
			title={matchingUser.displayName}
		/>
		<div class="f-column display-name ml-1">
			<span>{matchingUser.displayName}</span>
			<slot />
		</div>
	{/if}
</div>

<script lang="ts">
	import { requestUser, userRegistry, UserRegistryUser } from './stores/app';
	import SpikeSpinner from './SpikeSpinner.svelte';

	export let user: UserRegistryUser = null;
	export let userId: string = null;
	export let mode: 'full' | 'minimal' = 'full';

	$: matchingUser = user ?? $userRegistry[userId];
	$: userId && requestUser(userId);
</script>
