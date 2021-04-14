import {Booker} from "../db/booker";
import {NotificationCreateData, notifications} from "../db/notifications";
import {Harbinger, HarbingerFilterFunction} from "./harbinger";
import {ToastOptions} from "../types";
const notificationHarbinger = new Harbinger('notifications'),
    toastHarbinger = new Harbinger('toasts');

async function createNotificationForUser(userId: string, data: NotificationCreateData) {
    const notification = await notifications.create(userId, data);

    sendNotificationToUser(userId, {
        ...notification,
        variant: 'info',
    });
}

export async function createNotificationsForPermittedUsers(booker: Booker, action: string, data: NotificationCreateData) {
    const userIds = await booker.getUsersWithPermission(action);
    await Promise.all(userIds.map(async userId => {
        return createNotificationForUser(userId, data);
    }))
}

export async function createNotificationForSuperUser(data: NotificationCreateData) {
    const superUserId = process.env.SUPER_USER_ID;

    if (superUserId) {
        await createNotificationForUser(superUserId, data);
    }
}

export async function sendNotificationToUser(userId: string, toast: ToastOptions) {
    notificationHarbinger.filteredBroadcast('notification', async (uId) => {
        if (userId === uId) {
            return toast;
        }
    })
}
export async function sendToastToUser(userId: string, toast: ToastOptions) {
    toastHarbinger.filteredBroadcast('toast', async (uId) => {
        if (userId === uId) {
            return toast;
        }
    })
}

export async function broadcastToast(filterFn: HarbingerFilterFunction) {
    await toastHarbinger.filteredBroadcast('toast', filterFn);
}
