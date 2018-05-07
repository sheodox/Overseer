const StockPile = require('../db/stockpile');

module.exports = function(session) {
    const Store = session.Store;

    class SessionStore extends StockPile {
        constructor() {
            super({
                db: 'session-store',
                tables: [
                    {name: 'sessions', columns: {
                            accessed: 'INTEGER NOT NULL',
                            sid: 'TEXT NOT NULL PRIMARY KEY',
                            session: 'TEXT NOT NULL'
                        }
                    }
                ]
            });
        }
        async setSession(sid, session) {
            const data = {
                    sid,
                    session: JSON.stringify(session),
                    accessed: Date.now()
                },
                insertData = this.buildInsertMap(data);
            await this.run(`INSERT OR REPLACE INTO sessions ${insertData.sql}`, insertData.values);
        }
        async getSession(sid) {
            const data = await this.get(`SELECT session FROM sessions WHERE sid=?`, sid);
            return data ? JSON.parse(data.session) : null;
        }
        async touchSession(sid) {
            await this.run(`UPDATE sessions SET accessed=? WHERE sid=?`, Date.now(), sid);
        }
        async destroySession(sid) {
            await this.run(`DELETE FROM sessions WHERE sid=?`, sid);
        }
    }

    class SessionEmitter extends Store {
        constructor(...args) {
            super(...args);
            this.sp = new SessionStore();
        }
        async set(sid, session, callback) {
            await this.sp.setSession(sid, session);
            callback(null);
        }
        async get(sid, callback) {
            callback(null, await this.sp.getSession(sid));
        }
        async touch(sid, session, callback) {
            callback(null, await this.sp.touchSession(sid));
        }
        async destroy(sid, callback) {
            callback(null, await this.sp.destroySession(sid));
        }
    }
    return SessionEmitter;
};