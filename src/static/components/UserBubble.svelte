<style lang="scss">
	.user-bubble {
		position: relative;
	}
	.mode-minimal {
		--image-size: 1.3rem;
	}
	.mode-full {
		--image-size: 2.5rem;
	}
	.mode-rsvp {
		--image-size: 3rem;
	}
	img.minimal,
	.placeholder.minimal {
		margin: 0;
	}
	img,
	.placeholder {
		height: var(--image-size);
		width: var(--image-size);
		border-radius: 50%;
		margin-right: 0.2rem;
		background: var(--sx-bg);
	}
	.rsvp {
		position: absolute;
		bottom: 0;
		right: 0;
		background: var(--sx-gray-900);
		border-radius: 10rem;
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
		{#if mode === 'full'}
			<div class="f-column display-name align-items-start">
				<span>{matchingUser.displayName}</span>
				<slot />
			</div>
		{/if}
		{#if mode === 'rsvp' && rsvp}
			<div class="rsvp">
				<RsvpStatus status={rsvp} variant="minimal" />
			</div>
		{/if}
	{/if}
</div>

<script lang="ts">
	import { requestUser, userRegistry, UserRegistryUser } from './stores/app';
	import SpikeSpinner from './SpikeSpinner.svelte';
	import { RSVPStatus } from '../../shared/types/events';
	import RsvpStatus from './events/RSVPStatus.svelte';

	export let user: UserRegistryUser = null;
	export let userId: string = null;
	export let mode: 'full' | 'minimal' | 'rsvp' = 'full';
	export let rsvp: RSVPStatus | undefined = undefined;

	$: matchingUser = user ?? $userRegistry[userId];
	$: userId && requestUser(userId);
</script>
