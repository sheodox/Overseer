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
        <div class="panel f-column">
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
                                        <label>
                                            <input
                                                title={action}
                                                type="checkbox"
                                                checked={role.permissions[action]}
                                                on:change={() => togglePermission(booker.moduleName, role.id, action)}
                                            />
                                            <span class="sr-only">{action}</span>
                                        </label>
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

<script>
    import {Icon} from 'sheodox-ui';
    import {adminConduit, bookers, users} from "./admin-common";
    import RoleOptions from "./RoleOptions.svelte";

    function newRole(moduleName) {
        const roleName = prompt(`What do you want to call the new role for ${moduleName}?`)?.trim();

        if (roleName) {
            adminConduit.emit('new-role', moduleName, roleName);
        }
    }

    function togglePermission(moduleName, roleId, action) {
        adminConduit.emit('toggle-action', moduleName, roleId, action);
    }
</script>