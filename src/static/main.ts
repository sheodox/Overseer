/// <reference types="vite/client" />
/// <reference types="svelte" />
//import 'vite/modulepreload-polyfill';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { styles } from 'sheodox-ui';
import './scss/style.scss';
//import '../../node_modules/fontawesome-free/css/all.min.css';

import './components/stores/routing';
import App from './components/App.svelte';

// import Trancemaker from './components/Trancemaker';
// new Trancemaker();

new App({
	target: document.getElementById('app-root'),
});

addEventListener('load', async () => {
	const sw = navigator.serviceWorker.register('/sw.js');
});
