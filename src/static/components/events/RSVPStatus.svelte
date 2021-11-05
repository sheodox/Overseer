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

<script lang="ts">
	import Icon from 'sheodox-ui/Icon.svelte';

	export let status: string = null;
</script>
