import {writable} from "svelte/store";
import {Conduit} from "../../shared/conduit";
import {io} from 'socket.io-client';
window.socket = io();

export const adminConduit = new Conduit(window.socket, 'admin');

export const bookers = writable([]);
export const users = writable([]);

adminConduit.on({
    refresh: bookerDump => {
        bookers.set(bookerDump.bookers);
        users.set(bookerDump.users);
    }
})

adminConduit.emit('init');