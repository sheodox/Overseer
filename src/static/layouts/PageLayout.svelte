<style>
	.page-layout {
		width: 100%;
		max-width: 65rem;
	}
	@media (max-width: 700px) {
		h1 {
			font-size: var(--shdx-font-size-7);
		}
	}
</style>

<div class="page-layout f-column pb-4 pl-4 pr-4 pt-2">
	<div class="f-row justify-content-between align-items-center mb-2">
		<h1 class="m-0">{title}</h1>
		<slot name="beside-title" />
	</div>
	<slot />
</div>

<script lang="ts">
	export let title: string;
</script>
