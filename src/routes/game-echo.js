const Conduit = require('../util/conduit'),
    config = require('../config'),
    echoServerIP = config['games-server'],
    tracker = require('../util/GameTracker');

let echoConnected = false,
    ioConduit, echoSocket;

function broadcast() {
    ioConduit.emit('refresh', prepareData());
}

function prepareData() {
    return {
        echoServer: echoServerIP,
        games: tracker.list(),
        echoConnected
    };
}
//connection to overseer clients
const clientListener = socket => {
    const socketConduit = new Conduit(socket, 'echo');
    socketConduit.on({
        delete: name => {
            echoSocket.emit('delete', name);
        },
        init: () => {
            socketConduit.emit('refresh', prepareData());
        }
    });
};

//connection to game backup server
const echoListener = socket => {
    console.log('connected to echo server');
    echoConnected = true;
    broadcast();

    socket.on('disconnect', () => {
        echoConnected = false;
        broadcast();
    });

    echoSocket = socket;
    socket.on('new-game', gameData => {
        console.log(`new game: ${gameData.name}`);
        tracker.addGame(gameData);
        broadcast();
    });
    socket.on('delete-game', name => {
        console.log(`deleted game: ${name}`);
        tracker.deleteGame(name);
        broadcast();
    });
    //on connection events make sure we're always up to date
    socket.on('refresh', gameData => {
        //add or update all games so we are always up to date
        gameData.forEach(game => {
            tracker.addGame(game);
        });
        broadcast();
    })
};

module.exports = function (io) {
    io.on('connection', socket => {
        clientListener(socket);
    });
    ioConduit = new Conduit(io, 'echo');

    io .of('/echo-server')
        .on('connection', socket => {
            echoListener(socket);
        });
};