import { createSafeWebsocketHandler, Harbinger } from '../util/harbinger.js';
import { users } from '../db/users.js';
import { appBooker } from '../db/booker.js';
import { appLogger } from '../util/logger.js';
import { Envoy } from '../../shared/envoy.js';
import { sendToastToUser } from '../util/create-notifications.js';
import { io } from '../server.js';
import { Router } from 'express';
import { safeAsyncRoute } from '../util/error-handler.js';
import { notifications } from '../db/notifications.js';

io.on('connection', async (socket) => {
	const appEnvoy = new Envoy(socket, 'app'),
		userId = Harbinger.getUserId(socket);

	//don't attempt to let users who aren't signed in to connect to the websocket
	if (!userId) {
		return;
	}

	const checkPermission = createSafeWebsocketHandler(userId, appBooker, socket, appLogger);

	appEnvoy.on({
		getUserMeta: checkPermission('user_meta', async (userId, done) => {
			done((await users.getMasked([userId]))[0]);
		}),
		updateSettings: checkPermission('settings', async (settings) => {
			const updatedSettings = await users.updateSettings(userId, settings);

			if ('error' in updatedSettings) {
				return sendToastToUser(userId, {
					variant: 'error',
					title: 'Settings Error',
					message: 'Invalid settings update!',
				});
			}
		}),
		ensurePushSubscription: checkPermission('notifications', async (subscription: any) => {
			await notifications.ensurePushSubscription(userId, subscription);
		}),
	});
});

export const router = Router();

router.post(
	'/replace-push-subscription',
	safeAsyncRoute(async (req, res) => {
		await notifications.replacePushSubscription(req.body.oldEndpoint, req.body.newSubscription);
		res.send();
	})
);
