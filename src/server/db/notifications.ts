import {Notification} from '@prisma/client';
import {prisma} from "./prisma";
import {pickProperties} from "../util/object-manipulation";

export type NotificationCreateData = Pick<Notification, 'title' | 'message' | 'href'>

class Notifications {
    async create(userId: string, data: NotificationCreateData) {
        return await prisma.notification.create({
            data: {
                ...data,
                userId
            }
        })
    }

    async getNotifications(userId: string) {
        return (await prisma.notification.findMany({
            where: {
                userId
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 20
        }))
            .map(notification => {
                return pickProperties(notification, [
                    'id', 'href', 'message', 'read', 'createdAt', 'title'
                ])
            })
    }

    async markAllRead(userId: string) {
        await prisma.notification.updateMany({
            where: {userId},
            data: {
                read: true
            }
        })
    }
    async markRead(id: string) {
        return await prisma.notification.update({
            where: {id},
            data: {
                read: true
            }
        })
    }
}
export const notifications = new Notifications()