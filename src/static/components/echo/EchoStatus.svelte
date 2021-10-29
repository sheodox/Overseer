<style>
	div {
		max-width: 20rem;
	}
</style>

{#if $echoDiskUsage}
	<div>
		<label for="echo-disk-usage"
			>Disk Usage {bytes($echoDiskUsage.used, 'gb')} / {bytes($echoDiskUsage.total, 'gb')}gb</label
		>
		<Progress min={0} max={$echoDiskUsage.total} value={$echoDiskUsage.used} id="echo-disk-usage" />
	</div>
{/if}

<script>
	import { echoOnline, echoDiskUsage } from '../stores/echo';
	import { bytes } from '../../../shared/formatters';
	import { Progress } from 'sheodox-ui';
</script>
