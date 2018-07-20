const Conduit = require('./conduit');

/**
 * Back end socket helpers, "Silver" because silver is very conductive :D
 */
class SilverConduit extends Conduit {
    constructor(socket, name) {
        super(socket, name);
    }

    /**
     * Gets the socket's userId, or null if they're not logged in
     * @param socket
     * @returns {*}
     */
    static getUserId(socket) {
        try {
            return socket.handshake.session.passport.user.user_id;
        }
        catch(e) {
            return null;
        }
    }

    /**
     * Emit specific data for each socket. Can be used to broadcast data that's unique to each user or only send data if a user has permissions to it.
     * @param eventName - socket event name
     * @param {function<Promise|any>}filterFn - function, returns or resolves with data if it should be emitted to that socket
     */
    filteredBroadcast(eventName, filterFn) {
        const sockets = this.socket.sockets.sockets;
        for (let socketId in sockets) {
            if (sockets.hasOwnProperty(socketId)) {
                const socket = sockets[socketId],
                    userId = SilverConduit.getUserId(socket);
                Promise.resolve()
                    .then(() => {
                        return filterFn(userId);
                    })
                    .then((...data) => {
                        const isEmpty = data.length === 0 || data[0] === undefined;
                        //we don't necessarily need to send data to every socket, like if the data needs authentication but they don't have it
                        //so if we don't get anything just assume they shouldn't get any data
                        if (!isEmpty) {
                            this._send(socket, eventName, ...data);
                        }
                    })
                    .catch(e => {
                        console.error(`error during filtered broadcast for ${this.name}:${eventName}`, e);
                    })
            }
        }
    }
}

module.exports = SilverConduit;