<style>
	.panel {
		width: 30rem;
		max-width: 95vw;
		overflow: auto;
	}
	h2 {
		text-transform: capitalize;
		margin: 0;
	}
	.bookers {
		display: flex;
		flex-wrap: wrap;
	}
</style>

<div class="bookers f-row f-wrap justify-content-center">
	{#each $bookers as booker}
		<div class="panel f-column p-3 m-1">
			<div class="f-row justify-content-between">
				<h2>{booker.moduleName}</h2>
				<button on:click={() => newRole(booker.moduleName)}>
					<Icon icon="plus" />
					New Role
				</button>
			</div>
			{#if booker.roles.length > 0}
				<table>
					<thead>
						<tr>
							<th scope="col">Role Name</th>
							{#each booker.roles as role}
								<td>
									<RoleOptions {role} moduleName={booker.moduleName} />
								</td>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each booker.actions as action}
							<tr>
								<th scope="col">
									{action}
								</th>
								{#each booker.roles as role}
									<td>
										<Checkbox
											id="role-{role.id}-action-{action}"
											checked={role.permissions[action]}
											on:change={() => togglePermission(booker.moduleName, role.id, action)}
										>
											<span class="sr-only">{action}</span>
										</Checkbox>
									</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			{:else}
				<p>No roles for {booker.moduleName}.</p>
			{/if}
		</div>
	{/each}
</div>

<script lang="ts">
	import Icon from 'sheodox-ui/Icon.svelte';
	import Checkbox from 'sheodox-ui/Checkbox.svelte';
	import { adminEnvoy, bookers } from './admin-common';
	import RoleOptions from './RoleOptions.svelte';

	function newRole(moduleName: string) {
		const roleName = prompt(`What do you want to call the new role for ${moduleName}?`)?.trim();

		if (roleName) {
			adminEnvoy.emit('new-role', moduleName, roleName);
		}
	}

	function togglePermission(moduleName: string, roleId: string, action: string) {
		adminEnvoy.emit('toggle-action', moduleName, roleId, action);
	}
</script>
