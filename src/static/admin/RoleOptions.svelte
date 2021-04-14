<div>
    <MenuButton>
        <span slot="trigger">
            {role.name}
            <Icon icon="chevron-down" slot="trigger" />
        </span>
        <ul slot="menu">
            <li>
                <button on:click={rename}>
                    <Icon icon="edit"/> Rename
                </button>
            </li>
            <li>
                <button on:click={remove}>
                    <Icon icon="times" /> Delete
                </button>
            </li>
        </ul>
    </MenuButton>
</div>

<script>
    import {MenuButton, Icon} from 'sheodox-ui';
    import {adminEnvoy} from "./admin-common";

    export let role;
    export let moduleName;

    function rename() {
        const newName = prompt('Enter a role name', role.name)?.trim();
        if (newName) {
            adminEnvoy.emit('rename-role', moduleName, role.id, newName);
        }
    }

    function remove() {
        if (confirm(`Are you sure you want to remove ${role.name}?`)) {
            adminEnvoy.emit('delete-role', moduleName, role.id);
        }
    }
</script>