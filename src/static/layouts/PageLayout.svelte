<style>
	.page-layout {
		width: 100%;
		max-width: 65rem;
	}
</style>

<div class="page-layout f-column f-1 p-1">
	<div class="f-row justify-content-between align-items-baseline">
		<h1>{title}</h1>
		<slot name="beside-title" />
	</div>
	<slot />
</div>

<script>
	export let title;
</script>
