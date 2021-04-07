import '../../node_modules/sheodox-ui/style.scss';
import './scss/style.scss';

import './components/stores/routing'
import App from './components/App.svelte';

// import Trancemaker from './components/Trancemaker';
// new Trancemaker();

new App({
    target: document.getElementById('app-root')
})

