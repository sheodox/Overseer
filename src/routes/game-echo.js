var router = require('express').Router(),
    config = require('../config'),
    echoServerIP = config['games-server'],
    request = require('request'),
    io;

router.post('/upload', function(req, res) {
    var url = echoServerIP + '/upload';
    req
        .pipe(request.post({url:  url, headers: req.headers}))
        .pipe(res);
});

router.get('/delete/:game', (req, res) => {
    request(echoServerIP + '/delete/' + req.params.game)
        .pipe(res);
});

router.get('/list/', (req, res) => {
    if (echoServerIP) {
        console.log('requesting games list');
        request(echoServerIP + '/list', (err, response, body) => {
            if (err) {
                console.log('games server unreachable', err);
            }
            else {
                var games = JSON.parse(body).map(g => {
                    g.downloadURL = echoServerIP + '/download/' + g.game;
                    return g;
                });
                res.send(games);
            }
        });
    }
});

module.exports = function (sio) {
    io = sio;

    return router;
};