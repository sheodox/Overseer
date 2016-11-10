import FlatFile from './util/flatfile';
import valid from './util/validator';

const users = new FlatFile('./userdata.json', []);

const User = {
    register: function(sessionId, username) {
        username = String(username).trim();

        //let them through if it's already valid
        if (this.registered(sessionId, username)) {
            console.log(`already registered ${sessionId} ${username}`);
            return username;
        }
        //else validate and register
        else if (valid.name(sessionId) && valid.name(username) && !this.nameTaken(username)) {
            let existingSession = users.data.find(u => {
                return u.sessionId === sessionId;
            });
            if (existingSession) {
                existingSession.username = username;
            }
            else {
                users.data.push({
                    sessionId,
                    username
                });
            }
            console.log(`registered ${sessionId} ${username}`);
            this.save();
            return username;
        }
        //else it's invalid
        console.log(`invalid ${username}`);
        return false;
    },
    save: function() {
        users.save();
    },
    registered: function(sessionId, username) {
        return users.data.some(u => {
            return u.sessionId === sessionId && u.username === username;
        });
    },
    nameTaken: function(name) {
        return users.data.some(u => {
            return u.username === name;
        });
    },
    /**
     * Turns sessionIds into their equivalent usernames
     * @param sessions - array of sessionIDs
     */
    maskSessions: function(sessions) {
        return sessions.map(id => {
            return users.data.find(u => {
                return u.sessionId === id;
            }).username;
        });
    }
};

export default User;