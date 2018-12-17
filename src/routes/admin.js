const router = require('express').Router(),
    path = require('path'),
    su = require('../util/superuser'),
    Conduit = require('../util/conduit'),
    Users = require('../users'),
    bookers = {
        echo: require('../db/echobooker'),
        voter: require('../db/voterbooker'),
        lights: require('../db/lightsbooker'),
        proxy: require('../db/proxybooker')
    };
let io;

router.use('/admin', (req, res, next) => {
    if (su.isReqSuperUser(req)) {
        next();
    }
    else {
        res.status(301).redirect('/');
    }
});

router.get('/admin', (req, res) => {
    res.render('admin');
});
router.get('/admin/main.js', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin/main.js'));
});

function bindAdminSocketListeners(socket) {
    const adminConduit = new Conduit(socket, 'admin');

    adminConduit.on({
        init: async () => {
            await dump(socket);
        },
        'new-role': async (module, roleName) => {
            await bookers[module].newRole(roleName);
            await dump(socket);
        },
        'assign-role': async (module, user_id, role_id) => {
            await bookers[module].assignRole(user_id, role_id);
            await dump(socket);
        },
        'toggle-action': async (module, role_id, action) => {
            await bookers[module].toggleAction(role_id, action);
            await dump(socket);
        },
        'delete-role': async (module, role_id) => {
            await bookers[module].deleteRole(role_id);
            await dump(socket);
        },
        'rename-role': async (module, role_id, newName) => {
            await bookers[module].renameRole(role_id, newName);
            await dump(socket);
        }
     });
}

async function dump(socket) {
    const bookerDumps = {};
    for (let i in bookers) {
        if (bookers.hasOwnProperty(i)) {
            bookerDumps[i] = await bookers[i].dump();
        }
    }
    socket.emit('admin:refresh', {
        users: await Users.getAllUsers(),
        bookers: bookerDumps
    });
}

module.exports = function(i) {
    io = i;
    io.on('connection', socket => {
        const passport = socket.handshake.session.passport,
            userId = passport && passport.user ? passport.user.user_id : null;

        if (userId && su.isUserSuperUser(userId)) {
            bindAdminSocketListeners(socket);
        }
    });
    return router;
};
