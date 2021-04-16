import {writable} from "svelte/store";
import {Envoy} from "../../shared/envoy";
import {io} from 'socket.io-client';
window.socket = io();

export const adminEnvoy = new Envoy(window.socket, 'admin');

export const bookers = writable([]);
export const users = writable([]);

adminEnvoy.on({
    refresh: bookerDump => {
        bookers.set(bookerDump.bookers);
        users.set(bookerDump.users);
    }
})

adminEnvoy.emit('init');