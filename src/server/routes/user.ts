import {Server} from "socket.io";
import {createSafeWebsocketHandler, Harbinger} from "../util/harbinger";
import {users} from "../db/users";
import {appBooker} from "../db/booker";
import {appLogger} from "../util/logger";
import {Envoy} from "../../shared/envoy";
import {sendToastToUser} from "../util/create-notifications";

module.exports = (io: Server) => {
    io.on('connection', async socket => {
        const socketConduit = new Envoy(socket, 'app'),
            userId = Harbinger.getUserId(socket);

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
            }),
            updateSettings: checkPermission('settings', async (settings) => {
                const updatedSettings = await users.updateSettings(userId, settings);

                if ('error' in updatedSettings) {
                    return sendToastToUser(userId, {
                        variant: 'error',
                        title: 'Settings Error',
                        message: 'Invalid settings update!'
                    });
                }
            })
        });
    })
}
