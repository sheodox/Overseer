const SilverConduit = require('../util/SilverConduit'),
    config = require('../config'),
    echoServerIP = config['games-server'],
    tracker = require('../util/GameTracker'),
    echoBooker = require('../db/echobooker');

let echoConnected = false,
    ioConduit, notificationConduit, echoSocket, diskUsage;

/**
 * Emit data about all games to all connected authorized clients
 */
function broadcast() {
    const data = prepareData();
    ioConduit.filteredBroadcast('refresh', async userId => {
        //if they're not logged in, don't even check permissions
        if (!userId) {
            return;
        }
        const allowed = await echoBooker.check(userId, 'view');
        if (allowed) {
            return data;
        }
    });
}

function prepareData() {
    const allTags = {},
        games = tracker.list();
    games.forEach(game => {
        (game.tags || []).forEach(tag => {
            allTags[tag] = (allTags[tag] || 0) + 1;
        })
    });
    const sortableTags = [];
    Object
        .keys(allTags)
        .forEach(tag => {
            sortableTags.push({tag, count: allTags[tag]});
        });
    sortableTags.sort((a, b) => b.count - a.count);
    return {
        echoServer: echoServerIP,
        tagCloud: sortableTags.map(countInfo => countInfo.tag),
        games,
        diskUsage,
        echoConnected
    };
}
//connection to overseer clients
const clientListener = socket => {
    const socketConduit = new SilverConduit(socket, 'echo'),
        userId = SilverConduit.getUserId(socket);
    socketConduit.on({
        delete: async name => {
            if (await echoBooker.check(userId, 'delete')) {
                echoSocket.emit('delete', name);
            }
        },
        init: async () => {
            if (await echoBooker.check(userId, 'view')) {
                socketConduit.emit('refresh', prepareData());
            }
        },
        update: async (fileName, attr, val) => {
            if (await echoBooker.check(userId, 'update')) {
                tracker.update(fileName, attr, val);
                broadcast();
            }
        },
        downloaded: async fileName => {
            if (await echoBooker.check(userId, 'download')) {
                tracker.downloaded(fileName);
                broadcast();
            }
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
    socket.on('new-game', data => {
        console.log(`new game: ${data.game.fileName}`);
        console.log(data.game);
        //if it's a brand new game send a notification to everyone
        if (tracker.addGame(data.game)) {
            notificationConduit.emit('notification', {
                type: 'link',
                title: 'New game!',
                text: data.game.name,
                href: `/w/game-echo/details/${data.game.fileName}`
            });
        }
        diskUsage = data.diskUsage;
        broadcast();
    });
    socket.on('delete-game', data => {
        console.log(`deleted game: ${data.fileName}`);
        tracker.deleteGame(data.fileName);
        diskUsage = data.diskUsage;
        broadcast();
    });
    //on connection events make sure we're always up to date
    socket.on('refresh', data => {
        diskUsage = data.diskUsage;
        //add or update all games so we are always up to date
        data.games.forEach(game => {
            tracker.addGame(game);
        });
        broadcast();
    })
};

module.exports = function (io) {
    io.on('connection', socket => {
        clientListener(socket);
    });
    ioConduit = new SilverConduit(io, 'echo');
    notificationConduit = new SilverConduit(io, 'notifications');

    io .of('/echo-server')
        .on('connection', socket => {
            echoListener(socket);
        });
};