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

<script>
	import { Icon } from 'sheodox-ui';

	export let status;
</script>
