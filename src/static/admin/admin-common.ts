import { writable } from 'svelte/store';
import { Envoy } from '../../shared/envoy';
import { io } from 'socket.io-client';
import { User } from '../../shared/types/app';
import { BookerDump } from '../../shared/types/admin';

export const socket = io();

export interface UserDetailed extends User {
	pushSubscriptions: {
		createdAt: string;
		id: string;
	}[];
}
export const adminEnvoy = new Envoy(socket, 'admin');

export const bookers = writable<BookerDump[]>([]);
export const users = writable<UserDetailed[]>([]);

adminEnvoy.on({
	refresh: (bookerDump) => {
		console.log(bookerDump);
		bookers.set(bookerDump.bookers);
		users.set(bookerDump.users);
	},
});

adminEnvoy.emit('init');
