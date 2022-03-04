import { serialize, deserialize, isOnajiSerialized } from 'onaji';
import type { Socket } from 'socket.io';
import type { Socket as SocketClient } from 'socket.io-client';

interface EnvoyBindings {
	[eventName: string]: (...args: any) => any;
}

/**
 * Envoy is a wrapper around an individual socket connection with namespaced event names.
 */
export class Envoy {
	private readonly namespace: string;
	private readonly socket: Socket | SocketClient;
	bindings: [eventName: string, callback: any][];

	constructor(socket: Socket | SocketClient, namespace: string, initOnReconnect = false) {
		this.namespace = namespace;
		this.socket = socket;
		//store event handler settings for removing listeners later
		this.bindings = [];

		if (initOnReconnect) {
			// @ts-ignore - need to listen to reconnect events, but it's not directly on the socket, but in the
			// front end the socket type is is from `socket.io-client` which has this functionality.
			// this init event is the "get all the data" event on all apps in Overseer. Emitting this will
			// re-hydrate all data in the app.
			this.socket.io.on('reconnect', () => this.emit('init'));
		}
	}
	on(bindings: EnvoyBindings) {
		for (const rawName in bindings) {
			if (bindings.hasOwnProperty(rawName)) {
				// wrap the function in a deserializing function
				const eventName = this.namespace + ':' + rawName,
					fn = (...args: any[]) => {
						args = args.map((arg) => {
							if (isOnajiSerialized(arg)) {
								return deserialize(arg);
							}
							return arg;
						});
						return bindings[rawName](...args);
					};
				// @ts-ignore -- it doesn't like this line, todo fix this
				this.socket.on(eventName, fn);
				this.bindings.push([eventName, fn]);
			}
		}
	}

	/**
	 * Emit on the specified socket
	 * @param socket
	 * @param eventName
	 * @param args
	 * @private
	 */
	_send(socket: Socket | SocketClient, eventName: string, ...args: any) {
		const event = this.namespace + ':' + eventName;
		socket.emit(event, ...args);
	}
	emit(eventName: string, ...args: any) {
		//serialize any objects with onaji so Date objects and stuff can be
		//deserialized on the other end without any specific parsing
		args = args.map((arg: any) => {
			// prevent serializing of null, in JS it has a typeof 'object'
			if (arg && typeof arg === 'object') {
				return serialize(arg);
			}
			return arg;
		});
		this._send(this.socket, eventName, ...args);
	}
	destroy() {
		this.bindings.forEach((binding) => {
			const [name, fn] = binding;
			this.socket.off(name, fn);
		});
		this.bindings = [];
	}
}
