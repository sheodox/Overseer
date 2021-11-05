<div>
	<MenuButton>
		<span slot="trigger">
			{role.name}
			<Icon icon="chevron-down" slot="trigger" />
		</span>
		<ul slot="menu">
			<li>
				<button on:click={rename}>
					<Icon icon="edit" /> Rename
				</button>
			</li>
			<li>
				<button on:click={remove}>
					<Icon icon="times" /> Delete
				</button>
			</li>
			<li>
				<button on:click={allowAll}>
					<Icon icon="thumbs-up" /> Allow All
				</button>
			</li>
			<li>
				<button on:click={denyAll}>
					<Icon icon="thumbs-down" /> Deny All
				</button>
			</li>
		</ul>
	</MenuButton>
</div>

<script lang="ts">
	import { MenuButton, Icon } from 'sheodox-ui';
	import { BookerRole } from '../../shared/types/admin';
	import { adminEnvoy } from './admin-common';

	export let role: BookerRole;
	export let moduleName: string;

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

	function allowAll() {
		adminEnvoy.emit('set-all-allowed', moduleName, role.id);
	}

	function denyAll() {
		adminEnvoy.emit('set-all-denied', moduleName, role.id);
	}
</script>
