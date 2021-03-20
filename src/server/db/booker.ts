import {prisma} from "./prisma";
import {cache} from "sharp";

type BookerPermissions = {[action: string]: boolean}

class Booker {
    moduleName: string;
    allowedActions: string[];
    private userPermissionsCache = new Map<string, BookerPermissions>();

    constructor (moduleName: string, allowedActions: string[]) {
        this.moduleName = moduleName;
        this.allowedActions = allowedActions;
    }

    async getUserPermissions(userId: string): Promise<BookerPermissions> {
        if (!userId) {
            return this.denyAll();
        }

        const assignment = await prisma.bookerAssignment.findFirst({
            where: {userId, concern: this.moduleName},
            include: {
                role: true
            }
        });

        if (assignment) {
            return assignment.role.permissions as BookerPermissions;
        }
        return this.denyAll();
    }

    //a permissions object where everything is disallowed, used when no assignment is found for a user
    denyAll() {
        const permissions: BookerPermissions = {};
        this.allowedActions.forEach(action => {
            permissions[action] = false;
        })
        return permissions;
    }

    // check if the user has permissions to do this action
    async check(userId: string, action: string) {
        const cachedPermissions = this.userPermissionsCache.get(userId);
        if (cachedPermissions) {
            return cachedPermissions[action];
        }

        const userPermissions = await this.getUserPermissions(userId);
        this.userPermissionsCache.set(userId, userPermissions);
        return userPermissions[action];
    }
    static cleanRoleName(roleName: string) {
        if (!roleName) {
            return null;
        }
        //character whitelist
        return roleName.trim().replace(/[^\w\d-]/g, '');
    }
    async newRole(roleName: string) {
        roleName = Booker.cleanRoleName(roleName);

        if (roleName) {
            await prisma.bookerRole.create({
                data: {
                    name: roleName,
                    concern: this.moduleName,
                    permissions: this.denyAll()
                }
            })
        }
    }

    async toggleAction(roleId: string, action: string) {
        if (this.allowedActions.includes(action)) {
            //since we're changing a permission we need to start over with the cache,
            //lookups are normally quick so no surgical precision needed, just empty and
            //let it naturally rebuild
            this.userPermissionsCache.clear();

            const role = await prisma.bookerRole.findFirst({where: {id: roleId}});
            (role.permissions as BookerPermissions)[action] = !(role.permissions as BookerPermissions)[action];

            await prisma.bookerRole.update({
                where: {
                    id: roleId,
                },
                data: role
            });
        }
    }

    async renameRole(roleId: string, name: string) {
        name = Booker.cleanRoleName(name);
        if (name) {
            await prisma.bookerRole.update({
                where: {id: roleId},
                data: {name}
            })
        }
    }

    async deleteRole(roleId: string) {
        const deleteAssignments = prisma.bookerAssignment.deleteMany({
                where: {
                    roleId
                }
            }),
            deleteRole = prisma.bookerRole.delete({
                where: {
                    id: roleId
                }
            });

        await prisma.$transaction([deleteAssignments, deleteRole])
    }

    async assignRole(userId: string, roleId: string) {
        //a compound unique identifier for role assignments, because a user can
        //have only one role assignment for a concern
        const concern_userId = {
            concern: this.moduleName,
            userId
        };

        if (roleId) {
            await prisma.bookerAssignment.upsert({
                where: {concern_userId},
                update: {
                    roleId
                },
                create: {
                    roleId,
                    concern: this.moduleName,
                    userId
                }
            })
        }
        //clear assignment
        else {
            await prisma.bookerAssignment.delete({
                where: {concern_userId}
            })
        }
    }

    /**
     * Gets all data necessary for configuring roles and assignments
     * @returns {Promise<{assignments, roles}>}
     */
    async dump() {
        const whereThisBooker = {
            where: {
                concern: this.moduleName
            }
        };

        return {
            moduleName: this.moduleName,
            actions: this.allowedActions,
            assignments: await prisma.bookerAssignment.findMany(whereThisBooker),
            roles: await prisma.bookerRole.findMany(whereThisBooker)
        };
    }
}

export const echoBooker = new Booker('echo', [
    'view',
    'upload',
    'download',
    'delete',
    'update'
]);

export const voterBooker = new Booker('voter', [
    'vote',
    //the ability to remove other user's candidates. you can always remove your own.
    'remove_candidate',
    'rename_race',
    'remove_race',
    'reset_votes',
    'add_race',
    'add_candidate',
    'view',
    'add_image',
    'remove_image'
])