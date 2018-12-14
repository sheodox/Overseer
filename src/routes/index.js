const express = require('express'),
    serialize = require('serialize-javascript'),
    su = require('../util/superuser'),
    //bookers
    voterBooker = require('../db/voterbooker'),
    echoBooker = require('../db/echobooker'),
    lightsBooker = require('../db/lightsbooker'),
    proxyBooker = require('../db/proxybooker');

const router = express.Router();

/* GET home page for / and any client side routing urls */
router.get('/|/w/', async function(req, res) {
    const id = req.user ? req.user.user_id : null,
        permissions = serialize({
            voter: await voterBooker.getAllUserPermissions(id),
            echo: await echoBooker.getAllUserPermissions(id),
            lights: await lightsBooker.getAllUserPermissions(id)
        }),
        links = [
            {href: '/auth/logout', text: 'Logout'}
        ];

    if (su.isReqSuperUser(req)) {
        links.push({
            text: 'Admin', href: '/admin'
        });
    }
    
    if (await proxyBooker.check(id, 'view')) {
        links.push({
            text: 'Proxies', href: '/proxy'
        })
    }

    if (req.user) {
        res.render('index', {
            user: serialize({
                display_name: req.user.display_name,
                profile_image: req.user.profile_image,
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
