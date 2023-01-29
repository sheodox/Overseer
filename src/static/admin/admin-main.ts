/// <reference types="vite/client" />
/// <reference types="svelte" />
//import 'vite/modulepreload-polyfill';
import '../scss/style.scss';
import 'vite/modulepreload-polyfill';
import 'sheodox-ui/style.scss';
import '../scss/admin.scss';
import AdminApp from './AdminApp.svelte';

new AdminApp({
	target: document.getElementById('app-root'),
});
