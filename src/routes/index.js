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
router.get('/', entry);
router.get('/w/:module', entry);

async function entry(req, res) {
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
    
    //add the module name for social meta
    const moduleName = {
        'game-echo': 'Game Echo',
        voter: 'Voter',
        lights: 'Lights'
    }[req.params.module];
    
    if (req.user) {
        res.render('index', {
            title: (moduleName ? `${moduleName} - ` : '') + 'Overseer' ,
            site: 'Overseer',
            module: moduleName,
            description: 'LAN tools and home control.',
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
}

module.exports = router;
