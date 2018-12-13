const router = require('express').Router({strict: true}),
    request = require('request'),
    proxyBooker = require('../db/proxybooker'),
    proxies = require('../config.json').proxies || [];

router.get('/', async (req, res, next) => {
    if (req.user && await proxyBooker.check(req.user.user_id, 'view')) {
        res.render('proxy', {title: 'Proxies', proxies: proxies})
    }
    else {
        next();
    }
});


proxies.forEach(({name, url}) => {
    router.use(`/${name}/`, async (req, res, next) => {
        if (req.user && await proxyBooker.check(req.user.user_id, name)) {
            const hasQuery = req.url.includes('?');
            
            //block websocket connections, need to use relative xhr/fetch, but don't block socket.io.js
            //in case the other server falls back to xhr based on connection failures
            if (req.url.includes('socket.io/socket.io') && hasQuery) {
                res.status(404).send();
            }
            else {
                const query = hasQuery ? req.url.substr(req.url.indexOf('?')) : '';
                req.pipe(request.get(url + req.path + query)).pipe(res);
            }
        }
        else {
            next();
        }
    })
});

module.exports = router;
