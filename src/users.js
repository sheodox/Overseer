const StockPile = require('./db/stockpile'),
    debug = require('debug')('users');

class Users extends StockPile{
    constructor() {
        super({
            db: 'users',
            tables: [
                {name: 'users', columns: {
                        user_id: 'TEXT NOT NULL UNIQUE PRIMARY KEY', //unique google id given to us by oauth
                        display_name: 'TEXT NOT NULL', //real name as according to google
                        profile_image: 'TEXT NOT NULL', //profile picture url
                        raw: 'TEXT NOT NULL' //text of the full json given to us by google, for if we need to use some other data later
                    }
                }
            ]
        });
    }

    /**
     * Store or replace user data in the database, called when the user logs in from oAuth.
     * @param gProfile - google profile data
     * @param done - Passportjs callback
     * @returns {Promise<void>}
     */
    async register(gProfile, done) {
        const data = {
                user_id: gProfile.id,
                display_name: gProfile.displayName,
                profile_image: gProfile.photos[0].value,
                raw: JSON.stringify(gProfile)
            },
            prepared = this.buildInsertMap(data);

        debug(`registering user "${data.display_name}" (${data.user_id}`);

        await this.run(`INSERT OR REPLACE INTO users ${prepared.sql}`, prepared.values);
        done(null, data);
    }

    /**
     * Gets data for the specified user, returns null if the user doesn't exist.
     * @param id
     * @returns {Promise<null>}
     */
    async getUser(id) {
        const user = await this.get(`SELECT * FROM users WHERE user_id=?`, id);
        return user || null;
    }

    /**
     * Gets all user information
     * @returns {Promise<void>}
     */
    async getAllUsers() {
        return await this.all(`SELECT * FROM users`);
    }

    /**
     * Get the names and profile images of each user, just nothing private.
     * @param ids - the userIds of all the users to get information for
     * @returns {Promise<*>}
     */
    async getMasked(ids) {
        const masked = [];
        for (let i of ids) {
            const user = await this.getUser(i);
            if (user) {
                masked.push({
                    display_name: user.display_name,
                    profile_image: user.profile_image
                });
            }
        }
        return masked;
    }
}

module.exports = new Users();
