import { serialize } from 'onaji';
import { Envoy } from '../../shared/envoy.js';

import { Server, Socket } from 'socket.io';
import { Booker } from '../db/booker.js';
import { Logger } from 'winston';
import { ToastOptions } from '../types.js';
import { io } from '../server.js';

export function createSafeWebsocketHandler(userId: string, booker: Booker, socket: Socket, logger: Logger) {
	const toastEnvoy = new Envoy(socket, 'notifications');

	function errorToast(message: string) {
		toastEnvoy.emit('notification', {
			variant: 'error',
			title: 'Error',
			message,
		} as ToastOptions);
	}

	return (action: string, permittedHandler: (...args: any) => Promise<any>) => {
		return async (...args: any) => {
			try {
				if (await booker.check(userId, action)) {
					await permittedHandler(...args);
				} else {
					errorToast(`You don't have permission to do that.`);
				}
			} catch (e) {
				logger.error(`Error occurred processing handler for action "${action}"`, {
					userId: userId,
					error: e,
				});
				if (process.env.NODE_ENV === 'development') {
					console.error(e);
				}
				errorToast('Server error!');
			}
		};
	};
}

export type HarbingerFilterFunction = (userId: string) => Promise<any>;

/**
 * Back end socket helpers! This is a way to interact with a set of Envoy sockets on the server.
 */
export class Harbinger {
	private readonly namespace: string;

	constructor(namespace: string) {
		this.namespace = namespace;
	}

	/**
	 * Gets the socket's userId, or null if they're not logged in
	 * @param socket
	 * @returns {*}
	 */
	static getUserId(socket: Socket) {
		try {
			// @ts-ignore - todo find if this works and how to get it to be typed right
			return socket.request.session.passport.user.id;
		} catch (e) {
			return null;
		}
	}

	private getNamespacedEventName(eventName: string) {
		return `${this.namespace}:${eventName}`;
	}

	/**
	 * Emit specific data for each socket. Can be used to broadcast data that's unique to each user or only send data if a user has permissions to it.
	 */
	async filteredBroadcast(eventName: string, filterFn: HarbingerFilterFunction) {
		const sockets = io.of('/').sockets;
		//match the event namespace style of Envoy
		eventName = this.getNamespacedEventName(eventName);

		for (const socket of sockets.values()) {
			const userId = Harbinger.getUserId(socket),
				sendableData = await filterFn(userId);

			//by not returning any data, we skip this user (they don't have view permissions or something)
			if (sendableData) {
				socket.emit(
					eventName,
					// `null` is an object to JS, don't serialize that
					sendableData && typeof sendableData === 'object' ? serialize(sendableData) : sendableData
				);
			}
		}
	}

	// Emit the same data to all connected sockets of the user. This is needed when keeping
	// all of a user's open clients in sync (like for notifications) but it's not in response
	// to something contextually specific they've done (like a toast about invalid input)
	async broadcastToUser(eventName: string, userId: string, data?: any) {
		const sockets = io.of('/').sockets;
		eventName = this.getNamespacedEventName(eventName);

		for (const socket of sockets.values()) {
			const socketUserId = Harbinger.getUserId(socket);

			if (socketUserId === userId) {
				socket.emit(eventName, data);
			}
		}
	}
}
