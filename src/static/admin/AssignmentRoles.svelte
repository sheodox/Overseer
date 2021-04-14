<label>
    <span class="sr-only">Roles for {booker.moduleName}</span>
    <select
        on:change={e => assign(booker.moduleName, user.id, e.target.value)}
        bind:value={assignedRoleId}
    >
        <option value=""></option>
        {#each booker.roles as role}
            <option value={role.id}>{role.name}</option>
        {/each}
    </select>
</label>

<script>
    import {adminEnvoy} from "./admin-common";

    export let booker;
    export let user;

    $: assignedRoleId = getAssignedRole(booker.assignments, booker.moduleName, user.id);

    function getAssignedRole(assignments, moduleName, userId) {
        return assignments.find(assignment => {
            return assignment.concern === moduleName && assignment.userId === userId;
        })?.roleId || ''
    }

    function assign(moduleName, userId, roleId) {
        adminEnvoy.emit('assign-role', moduleName, userId, roleId);
    }
</script>