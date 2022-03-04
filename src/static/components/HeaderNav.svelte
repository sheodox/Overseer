<style>
</style>

<nav>
	<ul>
		{#each links as link}
			{#if link.viewable}
				<li>
					<a on:click|preventDefault={() => page(link.path)} class:active={link.app === $activeApp} href={link.path}>
						{link.text}
					</a>
				</li>
			{/if}
		{/each}
	</ul>
</nav>

<script lang="ts">
	import { activeApp } from './stores/routing';
	import { booker } from './stores/app';
	import page from 'page';

	const links = [
		{
			viewable: booker.events.view,
			path: '/events',
			app: 'events',
			text: 'Events',
			icon: 'calendar-week',
		},
		{
			viewable: booker.voter.view,
			path: '/voter',
			app: 'voter',
			text: 'Voter',
			icon: 'vote-yea',
		},
		{
			viewable: booker.echo.view,
			path: '/echo',
			app: 'echo',
			text: 'Echo',
			icon: 'download',
		},
	] as const;
</script>
