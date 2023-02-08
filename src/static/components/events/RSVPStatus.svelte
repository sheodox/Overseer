<style>
	div {
		border-radius: 10px;
	}
</style>

<div class="sx-badge-{statusColor} px-2 py-1 m-0">
	{#if status === 'going'}
		<Icon icon="calendar-check" />
		Going
	{:else if status === 'not-going'}
		<Icon icon="calendar-times" />
		Not Going
	{:else if status === 'maybe'}
		<Icon icon="question" />
		Maybe
	{/if}
</div>

<script lang="ts">
	import Icon from 'sheodox-ui/Icon.svelte';

	export let status: string = null;

	$: statusColor = {
		going: 'green',
		maybe: 'purple',
		'not-going': 'red',
	}[status];
</script>
