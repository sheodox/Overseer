<style>
	.panel {
		max-width: 95vw;
		overflow: auto;
	}
</style>

<div class="panel">
	<table>
		<thead>
			<tr>
				<th>User</th>
				<th>Push Subs</th>
				{#each $bookers as booker}
					<th>{booker.moduleName}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each $users as user}
				<tr>
					<td>
						<UserBubble user={{ loading: false, ...user }}>
							<em>Active {new Date(user.lastActiveAt).toLocaleDateString()}</em>
						</UserBubble>
					</td>
					<td class="text-align-right">
						<button on:click={() => showSubscriptions(user)} disabled={!user.pushSubscriptions.length}>
							{user.pushSubscriptions.length}
						</button>
					</td>
					{#each $bookers as booker}
						<td>
							<AssignmentRoles {booker} {user} />
						</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>

{#if showSubscriptionModal}
	<Modal bind:visible={showSubscriptionModal} title={`Push Subscriptions for ${userSubscriptionsShowing.displayName}`}>
		<table>
			<thead>
				<tr>
					<th>Created At</th>
				</tr>
			</thead>
			<tbody>
				{#each userSubscriptionsShowing.pushSubscriptions as sub}
					<tr>
						<td>{new Date(sub.createdAt).toLocaleString()}</td>
					</tr>
				{/each}
			</tbody>
		</table></Modal
	>
{/if}

<script lang="ts">
	import { users, bookers } from './admin-common';
	import type { UserDetailed } from './admin-common';
	import Modal from 'sheodox-ui/Modal.svelte';
	import AssignmentRoles from './AssignmentRoles.svelte';
	import UserBubble from '../components/UserBubble.svelte';

	let showSubscriptionModal = false,
		userSubscriptionsShowing: UserDetailed;

	function showSubscriptions(user: UserDetailed) {
		userSubscriptionsShowing = user;
		showSubscriptionModal = true;
	}
</script>
