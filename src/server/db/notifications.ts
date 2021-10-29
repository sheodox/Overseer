import { Notification } from '@prisma/client';
import { prisma } from './prisma';
import Ajv from 'ajv';
import { pickProperties } from '../util/object-manipulation';
import { appLogger } from '../util/logger';
const ajv = new Ajv(),
	validatePushSubscription = ajv.compile({
		type: 'object',
		properties: {
			endpoint: { type: 'string' },
			expirationTime: { type: 'number', nullable: true },
			keys: {
				type: 'object',
				properties: {
					p256dh: { type: 'string' },
					auth: { type: 'string' },
				},
			},
			additionalProperties: false,
		},
		additionalProperties: false,
	});

export type NotificationCreateData = Pick<Notification, 'title' | 'message' | 'href'>;

class Notifications {
	async create(userId: string, data: NotificationCreateData) {
		return await prisma.notification.create({
			data: {
				...data,
				userId,
			},
		});
	}

	async getNotifications(userId: string) {
		return (
			await prisma.notification.findMany({
				where: {
					userId,
				},
				orderBy: {
					createdAt: 'desc',
				},
				take: 20,
			})
		).map((notification) => {
			return pickProperties(notification, ['id', 'href', 'message', 'read', 'createdAt', 'title']);
		});
	}

	async markAllRead(userId: string) {
		await prisma.notification.updateMany({
			where: { userId },
			data: {
				read: true,
			},
		});
	}
	async markRead(id: string) {
		return await prisma.notification.update({
			where: { id },
			data: {
				read: true,
			},
		});
	}
	async registerPushSubscription(userId: string, subscription: PushSubscriptionJSON) {
		if (!validatePushSubscription(subscription)) {
			appLogger.error('Invalid push subscription', {
				error: validatePushSubscription.errors,
				subscription,
			});
			return { error: 'Invalid subscription!' };
		}

		//userIds aren't unique, one user can have multiple subscriptions for different devices
		return await prisma.userPushSubscription.create({
			data: {
				userId,
				//storing the subscription object as-is because it'll be passed as-is to web-push, no need
				//to really care what's in here, though we're still validating the object to prevent abuse
				subscription: subscription as any, // 'any' because prisma expects generic json
			},
		});
	}
	// if the browser decides to replace a subscription, this endpoint should update the last known subscription
	// with the new subscription details, so that device can keep getting push notifications
	async replacePushSubscription(oldEndpoint: string, subscription: PushSubscriptionJSON) {
		if (typeof oldEndpoint !== 'string' || !validatePushSubscription(subscription)) {
			return;
		}

		const existingSub = await prisma.userPushSubscription.findMany({
			where: {
				subscription: {
					path: ['endpoint'],
					equals: oldEndpoint,
				},
			},
		});

		if (existingSub.length) {
			// replace the subscription with the new one so we know who this user is still
			await prisma.userPushSubscription.update({
				where: { id: existingSub[0].id },
				data: { subscription: subscription as any },
			});
		}
	}
	// ensure that the subscription provided is saved for the user, so if the browser says they're subscribed
	// they should still get notifications
	async ensurePushSubscription(userId: string, subscription: PushSubscriptionJSON) {
		if (!validatePushSubscription(subscription)) {
			return;
		}

		const existingSub = await prisma.userPushSubscription.findMany({
			where: {
				subscription: {
					path: ['endpoint'],
					equals: subscription.endpoint,
				},
			},
		});

		if (!existingSub.length) {
			await prisma.userPushSubscription.create({
				data: {
					userId,
					subscription: subscription as any,
				},
			});
		}
	}
}
export const notifications = new Notifications();
