const Conduit = require('../util/conduit'),
    config = require('../config'),
    echoServerIP = config['games-server'];

let gamesList = [],
    echoConnected = false,
    ioConduit, echoSocket;

function broadcast() {
    ioConduit.emit('refresh', prepareData());
}

function prepareData() {
    return {
        echoServer: echoServerIP,
        games: gamesList,
        echoConnected
    };
}
function alphabetizeGames() {
    gamesList.sort((a, b) => {
        if (a.name < b.name) {
            return -1;
        }
        else if (a.name > b.name) {
            return 1;
        }
        return 0;
    });
}
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
        gamesList.push(gameData);
        alphabetizeGames();
        broadcast();
    });
    socket.on('delete-game', name => {
        console.log(`deleted game: ${name}`);
        const gameIndex = gamesList.findIndex(game => {
            return game.name === name;
        });
        if (gameIndex !== -1) {
            gamesList.splice(gameIndex, 1);
        }
        broadcast();
    });
    //on connection events make sure we're always up to date
    socket.on('refresh', gameData => {
        gamesList = gameData;
        alphabetizeGames();
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