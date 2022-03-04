import { Router } from 'express';
import { notifications } from '../db/notifications.js';
import { AppRequest } from '../types.js';
import { Envoy } from '../../shared/envoy.js';
import { createSafeWebsocketHandler, Harbinger } from '../util/harbinger.js';
import { appBooker } from '../db/booker.js';
import { appLogger } from '../util/logger.js';
import { io } from '../server.js';
import { sendToastToUser } from '../util/create-notifications.js';

export const router = Router();

//follow a notification redirect, and mark the notification as read automatically!
//users can get here by clicking push notifications
router.get('/n/:notificationId', async (req: AppRequest, res) => {
	//mark the notification as read and go to wherever they were supposed to lead
	const notification = await notifications.markRead(req.params.notificationId);

	//get the userId from the notification, not req.user, as there's a very real chance that
	//they aren't actually logged in, and if accessing req.user.id throws then they don't get redirected
	notificationHarbinger.broadcastToUser('markedRead', notification.userId, notification.id);
	res.redirect(notification.href || '/');
});

const notificationHarbinger = new Harbinger('notifications');
io.on('connection', (socket) => {
	const notificationsEnvoy = new Envoy(socket, 'notifications'),
		userId = Harbinger.getUserId(socket);

	//don't attempt to let users who aren't signed in to connect to the websocket
	if (!userId) {
		return;
	}

	const checkPermission = createSafeWebsocketHandler(userId, appBooker, socket, appLogger);

	notificationsEnvoy.on({
		init: checkPermission('notifications', async () => {
			notificationsEnvoy.emit('init', await notifications.getNotifications(userId));
		}),
		markRead: checkPermission('notifications', async (id) => {
			await notifications.markRead(id);
			notificationHarbinger.broadcastToUser('markedRead', userId, id);
		}),
		markAllRead: checkPermission('notifications', async () => {
			await notifications.markAllRead(userId);
			notificationHarbinger.broadcastToUser('markedAllRead', userId);
		}),
		registerPushSubscription: checkPermission('notifications', async (subscription) => {
			const subbed = await notifications.registerPushSubscription(userId, subscription);

			if ('error' in subbed) {
				sendToastToUser(userId, {
					variant: 'error',
					title: 'Notifications',
					message: subbed.error,
				});
			}
		}),
	});
});
