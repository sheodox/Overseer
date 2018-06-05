const StockPile = require('./stockpile'),
    Users = require('../users');

class Booker extends StockPile {
    constructor (moduleName, actions=[]) {
        super({
            db: `booker-${moduleName}`,
            tables: [
                //table to give names and IDs for each role
                {name: 'role_registry', columns: {
                        name: 'TEXT NOT NULL UNIQUE',
                        role_id: 'INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT',
                        permissions: 'INTEGER NOT NULL'
                    }
                },
                //table to assign roles to users
                {name: 'role_assignment', columns: {
                        user_id: 'TEXT NOT NULL PRIMARY KEY',
                        role_id: 'INTEGER'
                    }}
            ]
        });
        this.actions = actions;
    }

    /**
     * Generate a bitmask to extract the given value from the permissions number, for figuring out if an action is allowed
     * @param action
     * @returns {number}
     */
    getPermissionBitmask(action) {
        const index = this.actions.indexOf(action);
        return 1 << index;
    }

    /**
     * Gets an object of permissions for all actions for the specified user
     * @param userId
     * @returns {Promise<void>}
     */
    async getAllUserPermissions(userId) {
        //if the user's assigned role exists in the specified action table they have permission for that action, otherwise give the fallback
        const data = await this.get(`SELECT permissions FROM role_registry WHERE role_id=(SELECT role_id FROM role_assignment WHERE user_id=?)`, userId),
            permissions = data ? data.permissions : 0;
        return this.buildPermissionsMap(permissions);
    }

    /**
     * Build an object of which actions are allowable from the passed permissions number.
     * @param permissions
     */
    buildPermissionsMap(permissions) {
        const map = {};
        this.actions.forEach(action => {
            const bitmask = this.getPermissionBitmask(action);
            map[action] = !!(bitmask & permissions);
        });
        return map;
    }
    async check(userId, action) {
        const userPermissions = await this.getAllUserPermissions(userId);
        return userPermissions[action];
    }
    async newRole(roleName) {
        //character whitelist
        roleName = roleName.trim().replace(/[^\w\d-]/g, '');

        if (roleName) {
            await this.run(`INSERT INTO role_registry (name, permissions) VALUES (?, ?)`, roleName, 0);
        }
    }
    async toggleAction(role_id, action) {
        if (this.actions.includes(action)) {
            let permissions = (await this.get(`SELECT permissions FROM role_registry WHERE role_id=?`, role_id)).permissions;
            permissions ^= this.getPermissionBitmask(action);
            await this.run(`UPDATE role_registry SET permissions=? WHERE role_id=?`, permissions, role_id);
        }
    }
    async assignRole(user_id, role_id) {
        if (role_id !== '') {
            const data = this.buildInsertMap({role_id, user_id});
            await this.run(`INSERT OR REPLACE INTO role_assignment ${data.sql}`, data.values);
        }
        //clear assignment
        else {
            await this.run(`DELETE FROM role_assignment WHERE user_id=?`, user_id);
        }
    }

    /**
     * Gets all data necessary for configuring roles and assignments
     * @returns {Promise<{assignments, roles, users: *}>}
     */
    async dump() {
        const assignments = await this.all(`SELECT * FROM role_assignment LEFT JOIN role_registry ON role_registry.role_id = role_assignment.role_id`),
            roles = await this.all(`SELECT * FROM role_registry`),
            users = Users.getAll();
        roles.forEach(role => {
            role.permissions = this.buildPermissionsMap(role.permissions);
        });

        return {assignments, roles, users};
    }
}

module.exports = Booker;