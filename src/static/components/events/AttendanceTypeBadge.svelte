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

<script>
	import { Icon } from 'sheodox-ui';
	export let event;
	export let showText;

	const types = {
		virtual: { icon: 'globe', text: 'Virtual' },
		real: { icon: 'map-marked-alt', text: 'In Person' },
	};

	$: matchingType = types[event.attendanceType];
</script>
