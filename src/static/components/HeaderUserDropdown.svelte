<NavDropdown showOpenIcon={false}>
	<span slot="button">
		<UserBubble user={window.user} mode="minimal" />
	</span>
	<div slot="menu">
		<ul>
			{#if window.Booker.app.settings}
				<li>
					<Link href="/settings" classes="button">
						<Icon icon="cog" />
						Settings
					</Link>
				</li>
			{/if}
			{#each footerLinks as link}
				<li>
					<a href={link.href} class="button">
						<Icon icon={link.icon} />
						{link.text}
					</a>
				</li>
			{/each}
		</ul>
	</div>
</NavDropdown>

<script>
	import { Icon, NavDropdown } from 'sheodox-ui';
	import UserBubble from './UserBubble.svelte';
	import Link from './Link.svelte';

	const footerLinks = window.user?.links || [];
</script>
