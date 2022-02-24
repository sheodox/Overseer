<MenuButton triggerClasses="primary m-0">
	<span slot="trigger" class="rsvp-button" class:warning={status === 'going' && showFixGoingWarning}>
		{#if status}
			<RSVPStatus {status} />
		{:else}
			RSVP
		{/if}
		<Icon icon="chevron-down" />
	</span>
	<ul slot="menu">
		{#each statusOptions as statusOption}
			<li>
				<button on:click={() => rsvp(statusOption)}>
					<RSVPStatus status={statusOption} />
				</button>
			</li>
		{/each}
	</ul>
</MenuButton>
{#if showFixGoingWarning}
	<p class="shdx-badge-red p-2">
		You previously RSVP'd as going but the event is now held over multiple days. Please click "Going" again and select
		the days you're planning to attend!
	</p>
{/if}

<script lang="ts">
	import MenuButton from 'sheodox-ui/MenuButton.svelte';
	import Icon from 'sheodox-ui/Icon.svelte';
	import { createEventDispatcher } from 'svelte';
	import RSVPStatus from './RSVPStatus.svelte';
	import type { RSVPStatus as RSVPStatusTypes } from '../../../shared/types/events';

	const dispatch = createEventDispatcher(),
		statusOptions = ['going', 'maybe', 'not-going'] as const;

	export let status: RSVPStatusTypes;
	export let showFixGoingWarning = false;

	function rsvp(newStatus: RSVPStatusTypes) {
		dispatch('rsvp', newStatus);
	}
</script>
