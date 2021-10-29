import { Booker } from '../db/booker';
import { NotificationCreateData, notifications } from '../db/notifications';
import { Harbinger, HarbingerFilterFunction } from './harbinger';
import { ToastOptions } from '../types';
import { prisma } from '../db/prisma';
import push from 'web-push';
import { appLogger } from './logger';
import { UserSettings } from '@prisma/client';
import { EditableSettings, users } from '../db/users';
const notificationHarbinger = new Harbinger('notifications'),
	toastHarbinger = new Harbinger('toasts'),
	vapidContactEmail = process.env.PUSH_VAPID_CONTACT_EMAIL;

type NotificationTypeName = keyof Pick<
	UserSettings,
	'notifyNewEvents' | 'notifyEventReminders' | 'notifyEchoUploads' | 'notifySiteAnnouncements'
>;

export const vapidMetadataKeys = {
	publicKey: 'push_vapid_public_key',
	privateKey: 'push_vapid_private_key',
};

if (!vapidContactEmail) {
	appLogger.error('No VAPID contact email set! Please set a PUSH_VAPID_CONTACT_EMAIL environment variable.');
}

const pushReady = prisma.appMetadata
	.findFirst({
		where: { key: vapidMetadataKeys.publicKey },
	})
	.then(async (publicKey) => {
		if (!vapidContactEmail) {
			return;
		}

		//if we don't have any keys saved, generate them
		if (!publicKey) {
			appLogger.info('Push notification VAPID keys not found, generating some.');
			const keys = push.generateVAPIDKeys();
			await prisma.appMetadata.create({
				data: {
					key: vapidMetadataKeys.publicKey,
					value: keys.publicKey,
				},
			});
			await prisma.appMetadata.create({
				data: {
					key: vapidMetadataKeys.privateKey,
					value: keys.privateKey,
				},
			});
		}
	})
	.then(async () => {
		const { value: publicKey } = await prisma.appMetadata.findUnique({
				where: { key: vapidMetadataKeys.publicKey },
			}),
			{ value: privateKey } = await prisma.appMetadata.findUnique({
				where: { key: vapidMetadataKeys.privateKey },
			});

		push.setVapidDetails(`mailto:${vapidContactEmail}`, publicKey, privateKey);
	});

export async function createNotificationForUser(
	userId: string,
	data: NotificationCreateData,
	notificationTypeName: NotificationTypeName
) {
	const settings = await users.getSettings(userId);
	// ensure the user wants to receive this type of notification
	if (!settings[notificationTypeName]) {
		return;
	}

	const notification = await notifications.create(userId, data);

	sendNotificationToUser(userId, {
		...notification,
		variant: 'info',
	});

	const userSubscriptions = await prisma.userPushSubscription.findMany({
		where: { userId },
	});

	//don't send push notifications if they have those disabled
	if (!settings.pushNotifications) {
		return;
	}

	await pushReady;
	await Promise.all(
		userSubscriptions.map(async (userPushSub) => {
			try {
				await push.sendNotification(userPushSub.subscription as any, JSON.stringify(notification));
			} catch (e) {
				//a 410 status is given if the subscription is no longer valid
				//https://autopush.readthedocs.io/en/latest/http.html#error-codes
				if (e.statusCode === 410) {
					await prisma.userPushSubscription.delete({ where: { id: userPushSub.id } });
				} else {
					appLogger.warn(`Unknown status code received when trying to send a notification.`, {
						error: e,
					});
				}
			}
		})
	);
}

export async function createNotificationsForPermittedUsers(
	booker: Booker,
	action: string,
	data: NotificationCreateData,
	notificationTypeName: NotificationTypeName
) {
	const userIds = await booker.getUsersWithPermission(action);
	await Promise.all(
		userIds.map(async (userId) => {
			return createNotificationForUser(userId, data, notificationTypeName);
		})
	);
}

export async function createNotificationForSuperUser(data: NotificationCreateData) {
	const superUserId = process.env.SUPER_USER_ID;

	if (superUserId) {
		await createNotificationForUser(superUserId, data, 'notifySiteAnnouncements');
	}
}

export async function sendNotificationToUser(userId: string, toast: ToastOptions) {
	notificationHarbinger.filteredBroadcast('notification', async (uId) => {
		if (userId === uId) {
			return toast;
		}
	});
}
export async function sendToastToUser(userId: string, toast: ToastOptions) {
	toastHarbinger.filteredBroadcast('toast', async (uId) => {
		if (userId === uId) {
			return toast;
		}
	});
}

export async function broadcastToast(filterFn: HarbingerFilterFunction) {
	await toastHarbinger.filteredBroadcast('toast', filterFn);
}
