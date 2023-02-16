<style>
	.offline-message {
		margin: 0.5rem;
	}
	.input-group input {
		font-size: 0.9rem;
	}
	.input-group label {
		padding: 0.5rem;
	}
	.page-content {
		max-width: 60rem;
		margin: 1rem;
	}
</style>

<PageLayout title="Echo">
	<div slot="beside-title">
		{#if booker.echo.upload}
			<button on:click={() => page('/echo/upload')} class="primary" disabled={!$echoOnline}>
				<Icon icon="upload" />
				New Upload
			</button>
		{/if}
	</div>
	{#if !$echoInitialized}
		<PageSpinner />
	{:else}
		<div class="f-row justify-content-between">
			{#if $echoOnline}
				<EchoStatus />
			{:else}
				<span class="offline-message">
					<Icon icon="power-off" />
					Echo is offline!
				</span>
			{/if}
		</div>

		<div class="f-row align-items-center">
			<div class="input-group f-1 my-2">
				<label for="echo-search">
					<Icon icon="search" variant="icon-only" />
					<span class="sr-only"> Search </span>
				</label>
				<input
					bind:value={$echoSearch}
					id="echo-search"
					placeholder="search for a name or tags (comma separated)"
					class="f-1"
				/>
				<button on:click={() => ($echoSearch = '')}>
					<Icon icon="times" variant="icon-only" />
					<span class="sr-only"> Reset search </span>
				</button>
			</div>
			<button on:click={() => (showTagCloud = !showTagCloud)}>
				{showTagCloud ? 'Hide' : 'Show'} Tags
			</button>
		</div>
		{#if showTagCloud}
			<TagCloud bind:tags={$echoSearch} />
		{/if}
		<div class="f-row justify-content-end view-modes sx-toggles align-self-end">
			<input type="radio" bind:group={view} value={EchoViewLayout.List} id="view-as-list" />
			<label for="view-as-list">
				<Icon icon="list" variant="icon-only" />
				<span class="sr-only">View as a list</span>
			</label>
			<input type="radio" bind:group={view} value={EchoViewLayout.Grid} id="view-as-grid" />
			<label for="view-as-grid">
				<Icon icon="th" variant="icon-only" />
				<span class="sr-only">View as a grid</span>
			</label>
		</div>
	{/if}
</PageLayout>
{#if $echoInitialized}
	{#if numResults > 0}
		<div
			class={view === EchoViewLayout.Grid ? 'gap-3 f-row f-wrap justify-content-center' : 'page-content f-column gap-3'}
		>
			{#each $echoSearchResults as item}
				<EchoItemPreview {item} variant={view} />
			{/each}
		</div>
		<p class="text-align-center">
			{numResults === 1 ? 'one result' : `${numResults} results`}
		</p>
	{:else}
		<p class="text-align-center">No items matching this search.</p>
	{/if}
{/if}

<script context="module" lang="ts">
	export enum EchoViewLayout {
		Grid = 'grid',
		List = 'list',
	}
</script>

<script lang="ts">
	import page from 'page';
	import Icon from 'sheodox-ui/Icon.svelte';
	import { echoInitialized, echoOnline, echoSearch, echoSearchResults } from '../stores/echo';
	import { booker, pageName } from '../stores/app';
	import EchoStatus from './EchoStatus.svelte';
	import TagCloud from './TagCloud.svelte';
	import { activeQueryParams } from '../stores/routing';
	import PageSpinner from '../PageSpinner.svelte';
	import EchoItemPreview from './EchoItemPreview.svelte';
	import PageLayout from '../../layouts/PageLayout.svelte';

	let showTagCloud = false;
	let view = EchoViewLayout.Grid;

	$: numResults = $echoSearchResults.length;

	$pageName = 'Echo';

	echoSearch.set($activeQueryParams.search);
</script>
