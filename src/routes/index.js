import express from 'express';
const serialize = require('serialize-javascript'),
    su = require('../util/superuser'),
    voterBooker = require('../db/voterbooker'),
    echoBooker = require('../db/echobooker');

const router = express.Router();

/* GET home page for / and any client side routing urls */
router.get('/|/w/', async function(req, res) {
    const id = req.user ? req.user.profile.id : null,
        permissions = serialize({
            voter: await voterBooker.getAllUserPermissions(id),
            echo: await echoBooker.getAllUserPermissions(id)
        }),
        links = [
            {href: '/auth/logout', text: 'Logout'}
        ];

    if (su.isReqSuperUser(req)) {
        links.push({
            text: 'Admin', href: '/admin'
        });
    }

    if (req.user) {
        res.render('index', {
            user: serialize({
                displayName: req.user.profile.displayName,
                photoUrl: req.user.profile.photos.length ? req.user.profile.photos[0].value : '',
                links
            }),
            permissions
        });
    }
    else {
        res.render('index', {
            user: serialize(false),
            permissions
        });
    }
});

module.exports = router;
