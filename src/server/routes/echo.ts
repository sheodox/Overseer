import {echo} from '../db/echo';
import {createSafeWebsocketHandler, SilverConduit} from '../util/silver-conduit';
import {Server, Socket} from "socket.io";
import {Conduit} from "../../shared/conduit";
import {Echo as EchoItem} from "@prisma/client";
import {echoBooker} from "../db/booker";
import {ToastOptions} from "../types";
import {tags as formatTags} from "../../shared/formatters";
import {createIntegrationToken, verifyIntegrationToken} from "../util/integrations";
import {validate as uuidValidate} from 'uuid';
import {users} from "../db/users";
import MarkdownIt from "markdown-it";
import {echoIntegrationLogger, echoLogger} from "../util/logger";
const md = new MarkdownIt(),
    echoServerHost = process.env.ECHO_SERVER_HOST;

let echoOnline = false,
    echoConduit: SilverConduit,
    notificationConduit: SilverConduit,
    echoServerSocket: Socket,
    diskUsage: {
        total: number,
        used: number,
        free: number
    };

interface PreparedEchoItem extends EchoItem {
    //the url path to view this in Overseer
    path: string
    //the url path to edit this in Overseer
    editPath: string
    //a full URL for downloading this item from Echo (does not include the download token)
    downloadUrl: string
    //markdown rendered notes
    notesRendered: string
}

/**
 * Emit data about all games to all connected authorized clients
 */
async function broadcast() {
    const data = await prepareData();
    echoConduit.filteredBroadcast('refresh', async (userId: string) => {
        //if they're not logged in, don't even check permissions
        if (!userId) {
            return;
        }
        const allowed = await echoBooker.check(userId, 'view');
        if (allowed) {
            return data;
        }
    });
}
async function notificationBroadcast(notificationData: ToastOptions) {
    notificationConduit.filteredBroadcast('notification', async userId => {
        if (await echoBooker.check(userId, 'view')) {
            return notificationData;
        }
    });
}

async function prepareData() {
    const allTags: {[tag: string]: number} = {},
        items = await echo.list();

    items.forEach(item => {
        formatTags(item.tags).forEach(tag => {
            allTags[tag] = (allTags[tag] || 0) + 1;
        });

    });
    const sortableTags: {tag: string, count: number}[] = [];
    Object
        .keys(allTags)
        .forEach(tag => {
            sortableTags.push({tag, count: allTags[tag]});
        });
    sortableTags.sort((a, b) => b.count - a.count);

    const allUserIds = new Set<string>();
    items.forEach(item => {
        allUserIds.add(item.lastUploaderId);
        allUserIds.add(item.initialUploaderId);
    });
    const maskedUserMap = await users.getMaskedMap(Array.from(allUserIds));

    return {
        echoServerHost,
        tagCloud: sortableTags.map(countInfo => countInfo.tag),
        items: items.map(item => {
            return {
                ...item,
                path: `/echo/${item.id}`,
                editPath: `/echo/${item.id}/edit`,
                downloadUrl: `${echoServerHost}/download/${item.id}`,
                lastUploader: maskedUserMap.get(item.lastUploaderId),
                initialUploader: maskedUserMap.get(item.initialUploaderId),
                notesRendered: md.render(item.notes),
                //don't leak other user IDs, these will get removed when stringified
                lastUploaderId: undefined,
                initialUploaderId: undefined,
            }
        }) as PreparedEchoItem[],
        diskUsage,
        echoOnline: echoOnline,
    };
}
//connection to overseer clients
const clientListener = (socket: Socket) => {
    const socketConduit = new Conduit(socket, 'echo'),
        userId = SilverConduit.getUserId(socket);

    const checkPermission = createSafeWebsocketHandler(
        userId,
        echoBooker,
        socket,
        echoLogger
    );

    socketConduit.on({
        delete: checkPermission('delete', async (id: string) => {
            echoServerSocket.emit('delete', id, async () => {
                await echo.delete(id)
                broadcast();
            });
        }),
        init: checkPermission('view', async () => {
            socketConduit.emit('refresh', await prepareData());

            // if they're able to download things, give them a download token!
            if (await echoBooker.check(userId, 'download')) {
                const downloadToken = createIntegrationToken(
                    `Download token for user ${userId}`,
                    ['echo-download']
                );
                socketConduit.emit('downloadToken', downloadToken);
            }
        }),
        update: checkPermission('update', async (id, updatedData) => {
            await echo.update(id, updatedData);
            broadcast();
        }),
        new: checkPermission('upload', async (data, done) => {
            const item = await echo.new(data, userId);
            //tell echo it can expect an upload with this ID, it will deny uploads for anything it's not expecting
            echoServerSocket.emit('expect-upload', item.id, () => {
                done(item.id, `${echoServerHost}/upload/${item.id}`);
            });
            broadcast();
        }),
        updateFile: checkPermission('upload', async (id, data, done) => {
            if (uuidValidate(id) && echoOnline) {
                await echo.updateFile(id, data);
                broadcast();
                //tell echo it can expect an upload with this ID, it will deny uploads for anything it's not expecting
                echoServerSocket.emit('expect-upload', id, () => {
                    done(id, `${echoServerHost}/upload/${id}`);
                });
            }
        })
    });
};

//connection to echo server
const echoListener = (socket: Socket) => {
    echoIntegrationLogger.info(`Echo server connection established at ${new Date().toLocaleString()}`);
    echoOnline = true;
    broadcast();

    function safeHandler(handler: (...args: any) => Promise<any>) {
        return async (...args: any) => {
            try {
                await handler(...args);
            } catch (error) {
                echoIntegrationLogger.error('Echo server error!', {
                    error
                })
            }
        }
    }

    echoServerSocket = socket;
    echoServerSocket.on('disconnect', () => {
        echoOnline = false;
        echoIntegrationLogger.info(`Echo server connection lost at ${new Date().toLocaleString()}`);
        broadcast();
    });

    echoServerSocket.on('verify-download-token', safeHandler(async (token, id, done) => {
        const allowed = token && verifyIntegrationToken(token, 'echo-download');

        done({
            allowed,
            name: allowed ? (await echo.getItem(id))?.name : ''
        });
    }));

    echoServerSocket.on('downloaded', safeHandler(async id => {
        await echo.downloaded(id);
        broadcast();
    }))

    echoServerSocket.on('uploaded', safeHandler(async (id, data) => {
        //if it's a brand new game send a notification to everyone
        const uploadedItem = await echo.uploadFinished(id, data);
        if (uploadedItem) {
            notificationBroadcast({
                title: 'Echo - New Upload!',
                variant: 'info',
                message: uploadedItem.name,
                href: `/w/game-echo/details/${uploadedItem.id}`
            });
        }
        broadcast();
    }));

    //on connection events make sure we're always up to date
    echoServerSocket.on('refresh', safeHandler(async data => {
        diskUsage = data.diskUsage;
        broadcast();
    }));
};

module.exports = function (io: Server) {
    io.on('connection', (socket: Socket) => {
        clientListener(socket);
    });
    echoConduit = new SilverConduit(io, 'echo');
    notificationConduit = new SilverConduit(io, 'notifications');

    io.of((name, query, next) => {
        if (name === '/echo-server') {
            //only allow clients with a valid signed JWT token to connect to this
            next(null, verifyIntegrationToken(query.token, 'echo'));
        }
        else {
            next(null, true);
        }
    })
        .on('connection', (socket: Socket) => {
            echoListener(socket);
        });
};
