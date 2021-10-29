import '../../../node_modules/sheodox-ui/style.scss';
import '../scss/admin.scss';
import AdminApp from './AdminApp.svelte';

new AdminApp({
	target: document.getElementById('app-root'),
});
