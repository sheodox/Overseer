import {Conduit} from '../../shared/conduit';
import {Server, Socket} from "socket.io";
import {Booker} from "../db/booker";
import {Logger} from "winston";
import {ToastOptions} from "../types";

export function createSafeWebsocketHandler(
    userId: string,
    booker: Booker,
    socket: Socket,
    logger: Logger
) {
    const notificationConduit = new Conduit(socket, 'notifications');

    function errorToast(message: string) {
        notificationConduit.emit('notification', {
            variant: 'error',
            title: 'Error',
            message,
        } as ToastOptions)
    }

    return (action: string, permittedHandler: (...args: any) => Promise<any>) => {
        return async (...args: any) => {
            try {
                if (await booker.check(userId, action)) {
                    await permittedHandler(...args);
                } else {
                    errorToast(`You don't have permission to do that.`)
                }
            } catch (e) {
                logger.error(`Error occurred processing handler for action "${action}"`, {
                    userId: userId,
                    error: e
                });
                errorToast('Server error!');
            }
        };
    }
}

/**
 * Back end socket helpers, "Silver" because silver is very conductive :D
 */
export class SilverConduit extends Conduit {
    constructor(socket: Server | Socket, name: string) {
        super(socket, name);
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
        }
        catch(e) {
            return null;
        }
    }

    /**
     * Emit specific data for each socket. Can be used to broadcast data that's unique to each user or only send data if a user has permissions to it.
     */
    async filteredBroadcast(eventName: string, filterFn: (userId: string) => Promise<any>) {
        const sockets = (this.socket as Server).of('/').sockets;
        for (const socket of sockets.values()) {
            const userId = SilverConduit.getUserId(socket),
                sendableData = await filterFn(userId);

            //by not returning any data, we skip this user (they don't have view permissions or something)
            if (sendableData) {
                this._send(socket, eventName, sendableData);
            }
        }
    }
}