<style>
	main {
		flex: 1;
	}
</style>

<Header appName="Overseer" pageName="Admin">
	<SVG svgId="logo" slot="logo" />
</Header>
<main class="page-content">
	<div class="f-row justify-content-center">
		<TabList {tabs} bind:selectedTab />
	</div>
	<Tab tabId="assignments" {selectedTab}>
		<div class="f-column align-items-center">
			<h1>Assignments</h1>
			<Assignments />
		</div>
	</Tab>
	<Tab tabId="roles" {selectedTab}>
		<div class="f-column align-items-center">
			<h1>Roles</h1>
			<Roles />
		</div>
	</Tab>
	<Tab tabId="integrations" {selectedTab}>
		<div class="f-column align-items-center">
			<h1>Integrations</h1>
			<Integrations />
		</div>
	</Tab>
	<Tab tabId="announcements" {selectedTab}>
		<div class="f-column align-items-center">
			<h1>Announcements</h1>
			<CreateAnnouncement />
		</div>
	</Tab>
</main>
<Footer />

<script lang="ts">
	import Header from 'sheodox-ui/Header.svelte';
	import Tab from 'sheodox-ui/Tab.svelte';
	import TabList from 'sheodox-ui/TabList.svelte';
	import Footer from 'sheodox-ui/Footer.svelte';

	import SVG from '../components/SVG.svelte';
	import Integrations from './Integrations.svelte';
	import Roles from './Roles.svelte';
	import Assignments from './Assignments.svelte';
	import { pageName } from '../components/stores/app';
	import CreateAnnouncement from './CreateAnnouncement.svelte';

	$: $pageName = 'Admin';

	const tabs = [
		{
			id: 'assignments',
			title: 'Assignments',
		},
		{
			id: 'roles',
			title: 'Roles',
		},
		{
			id: 'integrations',
			title: 'Integrations',
		},
		{
			id: 'announcements',
			title: 'Announcements',
		},
	];
	let selectedTab: string;
</script>
