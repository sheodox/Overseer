<label>
	<span class="sr-only">Roles for {booker.moduleName}</span>
	<select on:change={(e) => assign(booker.moduleName, user.id, e)} bind:value={assignedRoleId}>
		<option value="" />
		{#each booker.roles as role}
			<option value={role.id}>{role.name}</option>
		{/each}
	</select>
</label>

<script lang="ts">
	import { adminEnvoy } from './admin-common';
	import type { BookerDump, BookerAssignment } from '../../shared/types/admin';
	import type { User } from '../../shared/types/app';

	export let booker: BookerDump;
	export let user: User;

	$: assignedRoleId = getAssignedRole(booker.assignments, booker.moduleName, user.id);

	function getAssignedRole(assignments: BookerAssignment[], moduleName: string, userId: string) {
		return (
			assignments.find((assignment) => {
				return assignment.concern === moduleName && assignment.userId === userId;
			})?.roleId || ''
		);
	}

	function assign(moduleName: string, userId: string, event: Event) {
		const roleId = (event.target as HTMLSelectElement).value;
		adminEnvoy.emit('assign-role', moduleName, userId, roleId);
	}
</script>
