/// <reference types="vite/client" />
/// <reference types="svelte" />
//import 'vite/modulepreload-polyfill';
import { styles } from 'sheodox-ui';
import '../scss/admin.scss';
import AdminApp from './AdminApp.svelte';

new AdminApp({
	target: document.getElementById('app-root'),
});
