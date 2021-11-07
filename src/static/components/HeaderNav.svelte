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
		{#if booker.app.notifications}
			<NotificationTrigger />
		{/if}
		{#if user.id}
			<HeaderUserDropdown />
		{/if}
	</ul>
</nav>

<script lang="ts">
	import { activeApp } from './stores/routing';
	import { booker, user } from './stores/app';
	import page from 'page';
	import NotificationTrigger from './notifications/NotificationTrigger.svelte';
	import HeaderUserDropdown from './HeaderUserDropdown.svelte';

	const links = [
		{
			viewable: booker.events.view,
			path: '/events',
			app: 'events',
			text: 'Events',
			icon: 'calendar-week',
		},
		{
			viewable: booker.echo.view,
			path: '/echo',
			app: 'echo',
			text: 'Echo',
			icon: 'download',
		},
		{
			viewable: booker.voter.view,
			path: '/voter',
			app: 'voter',
			text: 'Voter',
			icon: 'vote-yea',
		},
	] as const;
</script>
