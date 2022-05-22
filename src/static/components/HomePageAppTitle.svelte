<style>
	@media (max-width: 1000px) {
		h1 {
			font-size: var(--sx-font-size-7);
		}
	}
</style>

<div class="f-row justify-content-between align-items-baseline">
	<Link {href}>
		<h1 class="m-0">
			{title}
			<Icon icon="chevron-right" />
		</h1>
	</Link>
</div>

<script lang="ts">
	import Icon from 'sheodox-ui/Icon.svelte';
	import Link from './Link.svelte';

	export let title: string;
	export let href: string;
</script>
