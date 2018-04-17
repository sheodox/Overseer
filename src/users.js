import FlatFile from './util/flatfile';

const users = new FlatFile('./userdata.json', {});

const User = {
    register: function(gProfile, done) {
        //let them through if it's already valid
        const registeredUser = this.registered(gProfile.id);
        let u;
        if (registeredUser) {
            console.log(`already registered ${gProfile.displayName} ${gProfile.id}`);
            u = registeredUser;
            //update profile data
            u.profile = gProfile;
        }
        //else validate and register
        else {
            u = {
                overseer: {},
                profile: gProfile
            };
            users.data[gProfile.id] = u;
            console.log(`registered ${gProfile.displayName} ${gProfile.id}`);
        }
        this.save();
        done(null, u);
    },
    save: function() {
        users.save();
    },
    registered: function(id) {
        return users.data[id];
    },
    maskSessions: function(sessions) {
        return sessions.map(id => {
            const profile = this.registered(id).profile;
            return {
                name: profile.displayName,
                photo: profile.photos[0].value
            };
        });
    },
};

module.exports = User;
