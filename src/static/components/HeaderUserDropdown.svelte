<NavDropdown showOpenIcon={false}>
	<span slot="button">
		<UserBubble {user} mode="minimal" />
	</span>
	<div slot="menu">
		<ul>
			{#if booker.app.settings}
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

<script lang="ts">
	import Icon from 'sheodox-ui/Icon.svelte';
	import NavDropdown from 'sheodox-ui/NavDropdown.svelte';
	import UserBubble from './UserBubble.svelte';
	import Link from './Link.svelte';
	import { booker, user } from './stores/app';

	const footerLinks = user?.links || [];
</script>
