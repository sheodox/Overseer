import {Server} from "socket.io";
import {createSafeWebsocketHandler, SilverConduit} from "../util/silver-conduit";
import {users} from "../db/users";
import {appBooker} from "../db/booker";
import {appLogger} from "../util/logger";

module.exports = (io: Server) => {
    io.on('connection', async socket => {
        const socketConduit = new SilverConduit(socket, 'app'),
            singleUserNotifications = new SilverConduit(socket, 'notifications'),
            userId = SilverConduit.getUserId(socket);

        //don't attempt to let users who aren't signed in to connect to the websocket
        if (!userId) {
            return;
        }

        const checkPermission = createSafeWebsocketHandler(userId, appBooker, socket, appLogger);

        socketConduit.on({
            getUserMeta: checkPermission('user_meta', async (userId, done) => {
                done(
                    (await users.getMasked([userId]))[0]
                )
            })
        })
    })
}
