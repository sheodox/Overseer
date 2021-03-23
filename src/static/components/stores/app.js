import {writable} from 'svelte/store';

export const pageName = writable('');
pageName.subscribe(page => {
    const app = 'Overseer';
    document.title = page ? `${page} - ${app}` : app;
});