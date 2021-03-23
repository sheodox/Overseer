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
    <Tab tabId="roles" {selectedTab}>
        <div class="f-column align-items-center">
            <h1>Roles</h1>
            <Roles />
        </div>
    </Tab>
    <Tab tabId="assignments" {selectedTab}>
        <div class="f-column align-items-center">
            <h1>Assignments</h1>
            <Assignments />
        </div>
    </Tab>
    <Tab tabId="integrations" {selectedTab}>
        <div class="f-column align-items-center">
            <h1>Integrations</h1>
            <Integrations />
        </div>
    </Tab>
</main>
<Footer>

</Footer>

<script>
    import {Header, Tab, TabList, Footer} from 'sheodox-ui';
    import SVG from "../components/SVG.svelte";
    import Integrations from "./Integrations.svelte";
    import Roles from "./Roles.svelte";
    import Assignments from "./Assignments.svelte";

    const tabs = [{
        id: 'roles',
        title: 'Roles'
    }, {
        id: 'assignments',
        title: 'Assignments'
    }, {
        id: 'integrations',
        title: 'Integrations'
    }]
    let selectedTab;
</script>