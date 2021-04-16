import {Router} from "express";
import path from 'path';
import {Envoy} from "../../shared/envoy";
import {users} from "../db/users";
import {isReqSuperUser, isUserSuperUser} from '../util/superuser'
import {AppRequest} from "../types";
import {Server, Socket} from "socket.io";
import {appBooker, echoBooker, eventsBooker, voterBooker} from "../db/booker";
import {Prisma} from '@prisma/client';
import {Harbinger} from "../util/harbinger";
import {getManifest} from "../util/route-common";
import {createIntegrationToken} from "../util/integrations";
import {safeAsyncRoute} from "../util/error-handler";
import {adminLogger} from "../util/logger";
import {createNotificationsForPermittedUsers} from "../util/create-notifications";

const router = Router(),
    bookers = {
        echo: echoBooker,
        voter: voterBooker,
        events: eventsBooker,
        app: appBooker
    };

type BookerModule = keyof typeof bookers

let io: Server;

router.use('/admin', (req: AppRequest, res, next) => {
    if (isReqSuperUser(req)) {
        next();
    }
    else {
        res.status(301).redirect('/');
    }
});

router.get('/admin', safeAsyncRoute(async (req, res) => {
    res.render('admin', {
        manifest: await getManifest()
    });
}));
router.get('/admin/main.js', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin/main.js'));
});

function bindAdminSocketListeners(socket: Socket) {
    const adminConduit = new Envoy(socket, 'admin');

    function safeHandler(handler: (...args: any) => Promise<any>) {
        return async (...args: any) => {
            try {
                await handler(...args);
            } catch (error) {
                adminLogger.error('Error', {
                    error
                });
            }
        }
    }
    adminConduit.on({
        init: safeHandler(async () => {
            await dump(socket);
        }),
        'new-role': safeHandler(async (module: BookerModule, roleName) => {
            await bookers[module].newRole(roleName);
            await dump(socket);
        }),
        'assign-role': safeHandler(async (module: BookerModule, userId, roleId) => {
            await bookers[module].assignRole(userId, roleId);
            await dump(socket);
        }),
        'toggle-action': safeHandler(async (module: BookerModule, roleId, action) => {
            await bookers[module].toggleAction(roleId, action);
            await dump(socket);
        }),
        'delete-role': safeHandler(async (module: BookerModule, roleId) => {
            await bookers[module].deleteRole(roleId);
            await dump(socket);
        }),
        'rename-role': safeHandler(async (module: BookerModule, roleId, newName) => {
            await bookers[module].renameRole(roleId, newName);
            await dump(socket);
        }),
        'generate-integration-token': safeHandler(async (name: string, scopes: string[], done) => {
            done(createIntegrationToken(name, scopes));
        }),
        'create-announcement': safeHandler(async (title: string, message: string, href: string) => {
            createNotificationsForPermittedUsers(appBooker, 'notifications', {
                title,
                message,
                href
            }, 'notifySiteAnnouncements')
        }),
        'set-all-allowed': safeHandler(async (module: BookerModule, roleId: string) => {
            await bookers[module].setAllAllowed(roleId);
            await dump(socket);
        }),
        'set-all-denied': safeHandler(async (module: BookerModule, roleId: string) => {
            await bookers[module].setAllDenied(roleId);
            await dump(socket);
        })
    });
}

async function dump(socket: Socket) {
    const bookerDumps: {
        assignments: Prisma.BookerAssignmentGetPayload<{}>[]
        roles: Prisma.BookerRoleGetPayload<{}>[]
    }[] = [];

    for (let i in bookers) {
        if (bookers.hasOwnProperty(i)) {
            bookerDumps.push(await bookers[i as BookerModule].dump());
        }
    }

    socket.emit('admin:refresh', {
        users: await users.getAllUsers(),
        bookers: bookerDumps
    });
}

module.exports = function(i: Server) {
    io = i;
    io.on('connection', socket => {
        const userId = Harbinger.getUserId(socket);

        if (isUserSuperUser(userId)) {
            bindAdminSocketListeners(socket);
        }
    });
    return router;
};
