var router = require('express').Router(),
    config = require('../config'),
    echoServerIP = config['games-server'],
    request = require('request'),
    io;

router.post('/upload', function(req, res) {
    var url = echoServerIP + '/upload';
    console.log(req.headers);
    req
        .pipe(request.post({url:  url, headers: req.headers}))
        .pipe(res)
        .on('finish', sendGames.bind(null, io))
});

router.get('/delete/:game', (req, res) => {
    request(echoServerIP + '/delete/' + req.params.game).pipe(res)
        .on('finish', sendGames.bind(null, io))
});

function sendGames(destination) {
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
                destination.emit('games', games);
            }
        });
    }
}

module.exports = function (sio) {
    io = sio;
    io.on('connection', socket => {
        //get listing of available games
        sendGames(socket);
    });

    return router;
};