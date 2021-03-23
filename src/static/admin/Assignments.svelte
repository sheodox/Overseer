<style>
    img {
        width: 1.5rem;
        height: 1.5rem;
    }
</style>

<div class="panel">
    <table>
        <thead>
            <tr>
                <th>User</th>
                {#each $bookers as booker}
                    <th>{booker.moduleName}</th>
                {/each}
            </tr>
        </thead>
        <tbody>
            {#each $users as user}
                <tr>
                    <td>
                        <UserBubble {user}>
                            <em>Active {new Date(user.lastActiveAt).toLocaleDateString()}</em>
                        </UserBubble>
                    </td>
                    {#each $bookers as booker}
                        <td>
                            <AssignmentRoles
                                {booker}
                                {user}
                            />
                        </td>
                    {/each}
                </tr>
            {/each}
        </tbody>
    </table>
</div>

<script>
    import {users, bookers, adminConduit} from "./admin-common";
    import AssignmentRoles from "./AssignmentRoles.svelte";
    import UserBubble from "../components/UserBubble.svelte";

</script>