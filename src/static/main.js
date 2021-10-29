import { styles } from 'sheodox-ui';
import './scss/style.scss';

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
