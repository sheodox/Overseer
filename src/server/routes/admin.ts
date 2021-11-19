import { Router } from 'express';
import { Envoy } from '../../shared/envoy.js';
import { users } from '../db/users.js';
import { isReqSuperUser, isUserSuperUser } from '../util/superuser.js';
import { AppRequest } from '../types.js';
import { Socket } from 'socket.io';
import { appBooker, echoBooker, eventsBooker, voterBooker } from '../db/booker.js';
import { Harbinger } from '../util/harbinger.js';
import { getManifest } from '../util/route-common.js';
import { createIntegrationToken } from '../util/integrations.js';
import { safeAsyncRoute } from '../util/error-handler.js';
import { adminLogger } from '../util/logger.js';
import { io } from '../server.js';
import { createNotificationsForPermittedUsers } from '../util/create-notifications.js';
import type { BookerModuleName, BookerDump } from '../../shared/types/admin';
import serializeJavascript from 'serialize-javascript';
import { serialize } from 'onaji';

export const router = Router();
export const BOOKERS = {
	echo: echoBooker,
	voter: voterBooker,
	events: eventsBooker,
	app: appBooker,
} as const;

router.use('/admin', (req: AppRequest, res, next) => {
	if (isReqSuperUser(req)) {
		next();
	} else {
		res.status(301).redirect('/');
	}
});

router.get(
	'/admin',
	safeAsyncRoute(async (req, res) => {
		const { cssImports, scriptEntryFile } = await getManifest('src/static/admin/admin-main.ts');

		res.render('admin', {
			cssImports,
			scriptEntryFile,
			development: process.env.NODE_ENV === 'development',
			appBootstrap: serializeJavascript({}),
		});
	})
);

function bindAdminSocketListeners(socket: Socket) {
	const adminConduit = new Envoy(socket, 'admin');

	function safeHandler(handler: (...args: any) => Promise<any>) {
		return async (...args: any) => {
			try {
				await handler(...args);
			} catch (error) {
				adminLogger.error('Error', {
					error,
				});
			}
		};
	}
	adminConduit.on({
		init: safeHandler(async () => {
			await dump(socket);
		}),
		'new-role': safeHandler(async (module: BookerModuleName, roleName) => {
			await BOOKERS[module].newRole(roleName);
			await dump(socket);
		}),
		'assign-role': safeHandler(async (module: BookerModuleName, userId, roleId) => {
			await BOOKERS[module].assignRole(userId, roleId);
			await dump(socket);
		}),
		'toggle-action': safeHandler(async (module: BookerModuleName, roleId, action) => {
			await BOOKERS[module].toggleAction(roleId, action);
			await dump(socket);
		}),
		'delete-role': safeHandler(async (module: BookerModuleName, roleId) => {
			await BOOKERS[module].deleteRole(roleId);
			await dump(socket);
		}),
		'rename-role': safeHandler(async (module: BookerModuleName, roleId, newName) => {
			await BOOKERS[module].renameRole(roleId, newName);
			await dump(socket);
		}),
		'generate-integration-token': safeHandler(async (name: string, scopes: string[], done) => {
			done(createIntegrationToken(name, scopes));
		}),
		'create-announcement': safeHandler(async (title: string, message: string, href: string) => {
			createNotificationsForPermittedUsers(
				appBooker,
				'notifications',
				{
					title,
					message,
					href,
				},
				'notifySiteAnnouncements'
			);
		}),
		'set-all-allowed': safeHandler(async (module: BookerModuleName, roleId: string) => {
			await BOOKERS[module].setAllAllowed(roleId);
			await dump(socket);
		}),
		'set-all-denied': safeHandler(async (module: BookerModuleName, roleId: string) => {
			await BOOKERS[module].setAllDenied(roleId);
			await dump(socket);
		}),
	});
}

async function dump(socket: Socket) {
	const bookerDumps: BookerDump[] = [];

	for (let i in BOOKERS) {
		if (BOOKERS.hasOwnProperty(i)) {
			bookerDumps.push(await BOOKERS[i as BookerModuleName].dump());
		}
	}

	socket.emit(
		'admin:refresh',
		serialize({
			users: await users.getAllUsers(),
			bookers: bookerDumps,
		})
	);
}

io.on('connection', (socket) => {
	const userId = Harbinger.getUserId(socket);

	if (isUserSuperUser(userId)) {
		bindAdminSocketListeners(socket);
	}
});
