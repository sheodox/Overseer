const router = require('express').Router(),
    config = require('../config'),
    echoServerIP = config['games-server'],
    actions = require('../actions/act-echo-server').default,
    store = require('../reducers/reducers').default;

let io, echoSocket,
    previousGamesCount = -1;

store.subscribe(function() {
    let echoStore = store.getState().echo,
        newGamesCount = echoStore.games.length;

    if (io && newGamesCount !== previousGamesCount) {
        io.emit('games/refresh', echoStore);
    }
    previousGamesCount = newGamesCount;
});

const clientListener = socket => {
    socket.on('games/delete', name => {
        echoSocket.emit('delete', name);
    });

};

const echoListener = socket => {
    console.log('connected to echo server');

    echoSocket = socket;
    socket.on('new-game', gameData => {
        console.log(`new game: ${gameData.name}`);
        store.dispatch(actions.newGame(gameData));
    });
    socket.on('delete-game', name => {
        store.dispatch(actions.deleteGame(name));
    });
    //on connection events make sure we're always up to date
    socket.on('refresh', gameData => {
        store.dispatch(actions.refreshGames({
            games: gameData,
            echoServer: echoServerIP
        }));
    })
};

module.exports = function (sio) {
    io = sio;
    io.on('connection', socket => {
        clientListener(socket);
    });

    io
        .of('/echo-server')
        .on('connection', socket => {
            echoListener(socket);
        });
    return router;
};