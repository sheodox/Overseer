<style>
	main {
		flex: 1;
		position: relative;
	}
	:global(header h1) {
		font-family: 'Kanit', sans-serif;
	}
	:global(header) {
		position: sticky;
		z-index: 100;
		top: 0;
	}
	#connection-error {
		width: 100%;
		background: var(--shdx-red-500);
		color: white;
		text-align: center;
		padding: var(--shdx-spacing-1);
	}
</style>

<Header appName="Overseer" on:titleclick={titleClick} titleClickPreventDefault={true} href="/">
	<SVG svgId="logo" slot="logo" />
	<HeaderNav slot="headerCenter" />
	<nav slot="headerEnd">
		<ul>
			{#if booker.app.notifications}
				<NotificationTrigger />
			{/if}
			{#if user.id}
				<HeaderUserDropdown />
			{/if}
		</ul>
	</nav>
</Header>
{#if !$socketConnected}
	<div id="connection-error">Connection to server lost.</div>
{/if}
<main class="f-column justify-content-start align-items-center">
	<Toasts />
	{#if user.id}
		<Routing />
	{:else}
		<LoginRequired />
	{/if}
</main>
<Footer>
	<div class="page-content">
		<nav class="simple-footer-links">
			<ul>
				{#each footerLinks as link}
					<li>
						<a href={link.href}>
							<Icon icon={link.icon} />
							{link.text}
						</a>
					</li>
				{/each}
			</ul>
		</nav>
	</div>
</Footer>

<script lang="ts">
	import Toasts from 'sheodox-ui/Toasts.svelte';
	import Icon from 'sheodox-ui/Icon.svelte';
	import Header from 'sheodox-ui/Header.svelte';
	import Footer from 'sheodox-ui/Footer.svelte';
	import { booker, socketConnected, user } from './stores/app';
	import SVG from './SVG.svelte';
	import Routing from './Routing.svelte';
	import LoginRequired from './LoginRequired.svelte';
	import HeaderNav from './HeaderNav.svelte';
	import page from 'page';
	import NotificationTrigger from './notifications/NotificationTrigger.svelte';
	import HeaderUserDropdown from './HeaderUserDropdown.svelte';

	const footerLinks = user?.links || [];

	function titleClick() {
		page('/');
	}
</script>
