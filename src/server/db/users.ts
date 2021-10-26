import {prisma} from "./prisma";
import {User, UserSettings} from '@prisma/client';
import {Profile} from "passport-google-oauth";
import {ShortCache} from "../util/ShortCache";
import {createNotificationForSuperUser} from "../util/create-notifications";
import Ajv from 'ajv';

export type MaskedUser = Pick<User, 'id' | 'displayName' | 'profileImage'>

const userBooleanSettings = [
    'pushNotifications',
    'notifyNewEvents',
    'notifyEventReminders',
    'notifyEchoUploads',
    'notifySiteAnnouncements'
] as const;
export type EditableSettings = keyof Pick<UserSettings, typeof userBooleanSettings[number]>

const ajv = new Ajv(),
    validateUserSettings = ajv.compile({
        type: 'object',
        properties: userBooleanSettings.reduce((props, settingName) => {
            props[settingName] = {type: 'boolean'};
            return props;
        }, {} as Record<string, {type: 'boolean'}>)
    })

class Users {
    maskCache: ShortCache<MaskedUser>
    constructor() {
        this.maskCache = new ShortCache<MaskedUser>(10 * 60 * 1000);
    }

    /**
     * Store or replace user data in the database, called when the user logs in from oAuth.
     * @param googleProfile - google profile data
     * @returns {Promise<void>}
     */
    async register(googleProfile: Profile) {
        const oauthId = `google-${googleProfile.id}`,
            userData = {
                oauthId,
                displayName: googleProfile.displayName,
                profileImage: googleProfile.photos[0].value,
            };

        let user = await prisma.user.findFirst({
            where: {
                oauthId
            }
        })

        if (!user) {
            user = await prisma.user.create({
                data: userData
            });
            createNotificationForSuperUser({
                title: "Admin",
                message: `New user "${user.displayName}"`,
                href: '/admin'
            })
        }
        else {
            await prisma.user.update({
                data: userData,
                where: {
                    oauthId
                }
            });
        }

        return user;
    }

    /**
     * Gets data for the specified user, returns null if the user doesn't exist.
     * @param id
     * @returns {Promise<null>}
     */
    async getUser(id: string) {
        return await prisma.user.findUnique({
            where: {id}
        })
    }

    async getAllUsers() {
        return await prisma.user.findMany({
			include: {
				pushSubscriptions: {
					select: {
						id: true,
						createdAt: true
					}
				}
			}
		})
    }

    /**
     * Get the names and profile images of each user, just nothing private.
     * @param ids - the userIds of all the users to get information for
     * @returns {Promise<*>}
     */
    async getMasked(ids: string[]): Promise<MaskedUser[]> {
        return Array.from(
            (await this.getMaskedMap(ids)).values()
        )
    }

    async getMaskedMap(ids: string[]): Promise<Map<string, MaskedUser>> {
        const maskedMap = new Map(),
            uncachedIds = [];

        for (const id of ids) {
            const mask = this.maskCache.get(id);
            mask ? maskedMap.set(id, mask) : uncachedIds.push(id);
        }

        if (uncachedIds.length) {
            const users = await prisma.user.findMany({
                where: {
                    id: {in: uncachedIds}
                }
            });

            for (const user of users) {
                const mask = {
                    displayName: user.displayName,
                    profileImage: user.profileImage,
                    id: user.id
                };
                maskedMap.set(user.id, mask);
                this.maskCache.set(user.id, mask);
            }
        }

        return maskedMap;
    }

    //update the users's lastActiveAt
    async touch(id: string) {
        await prisma.user.update({
            where: {id},
            data: {
                lastActiveAt: new Date()
            }
        })
    }

    async getSettings(userId: string) {
        let settings = await prisma.userSettings.findUnique({
            where: {userId}
        });

        if (!settings) {
            //we just need settings for this user, all settings have default column values
            //so no need to specify any of them right here!
            settings = await prisma.userSettings.create({
                data: {userId}
            });
        }

        return settings;
    }

    async updateSettings(userId: string, settings: EditableSettings) {
        if (!validateUserSettings(settings)) {
            return {error: 'Invalid settings!'};
        }

        return await prisma.userSettings.update({
            where: {userId},
            data: settings
        });
    }
}

export const users = new Users();
