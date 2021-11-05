import { writable, derived, get } from 'svelte/store';
import { createAutoExpireToast } from 'sheodox-ui';
import { Envoy } from '../../../shared/envoy';
import { socket } from '../../socket';
import { booker } from './app';

const notificationsEnvoy = new Envoy(socket, 'notifications', true);

export const notificationsInitialized = writable(false);
export const notifications = writable([], (set) => {
	if (!booker.app.notifications || get(notificationsInitialized)) {
		return;
	}

	notificationsEnvoy.emit('init');
});
export const unreadNotificationCount = derived(notifications, (notifications) => {
	return notifications.reduce((count, notification) => {
		return count + (notification.read ? 0 : 1);
	}, 0);
});

notificationsEnvoy.on({
	init: (data) => {
		notifications.set(data);
		notificationsInitialized.set(true);
	},
	notification: (data) => {
		notifications.update((notifications) => {
			createAutoExpireToast(data);
			return [data, ...notifications];
		});
	},
	markedAllRead: () => {
		notifications.update((notifications) => {
			notifications.forEach((notification) => (notification.read = true));
			return notifications;
		});
	},
	markedRead: (id) => {
		notifications.update((notifications) => {
			notifications.forEach((notification) => {
				if (notification.id === id) {
					notification.read = true;
				}
			});
			return notifications;
		});
	},
});

export const notificationOps = {
	markRead: (id: string) => {
		notificationsEnvoy.emit('markRead', id);
	},
	markAllRead: () => {
		notificationsEnvoy.emit('markAllRead');
	},
	registerPushSubscription: (subscription: any) => {
		notificationsEnvoy.emit('registerPushSubscription', subscription);
	},
};
