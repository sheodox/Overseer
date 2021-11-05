<style>
</style>

<span class="attendance-type" title={showText ? '' : matchingType.text}>
	<Icon icon={matchingType.icon} />
	{#if showText}
		{matchingType.text}
	{:else}
		<span class="sr-only">
			{matchingType.text}
		</span>
	{/if}
</span>

<script lang="ts">
	import Icon from 'sheodox-ui/Icon.svelte';
	import type { MaskedEvent } from '../../../shared/types/events';

	export let event: MaskedEvent;
	export let showText = false;

	const types = {
		virtual: { icon: 'globe', text: 'Virtual' },
		real: { icon: 'map-marked-alt', text: 'In Person' },
	} as const;

	$: matchingType = types[event.attendanceType as keyof typeof types];
</script>
