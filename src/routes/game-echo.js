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
async function broadcast() {
    const data = await prepareData();
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

async function prepareData() {
    const allTags = {},
        games = await tracker.list();
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
                socketConduit.emit('refresh', await prepareData());
            }
        },
        update: async (file, attr, val) => {
            if (await echoBooker.check(userId, 'update')) {
                await tracker.update(file, attr, val);
                broadcast();
            }
        },
        downloaded: async file => {
            if (await echoBooker.check(userId, 'download')) {
                await tracker.downloaded(file);
                broadcast();
            }
        },
        'new-game': async (data, done) => {
            if (await echoBooker.check(userId, 'upload')) {
                await tracker.addGame(data, userId);
                done();
            }
        }
    });
};

//connection to game backup server
const echoListener = socket => {
    console.log('connected to echo server');
    echoConnected = true;
    broadcast();

    echoSocket = socket;
    echoSocket.on('disconnect', () => {
        echoConnected = false;
        broadcast();
    });
    echoSocket.on('new-game', async data => {
        console.log(`new game: ${data.game.file}`);
        console.log(data.game);
        //if it's a brand new game send a notification to everyone
        const addedGame = await tracker.addGame(data.game);
        if (addedGame) {
            notificationConduit.emit('notification', {
                type: 'link',
                title: 'New game!',
                text: addedGame.name,
                href: `/w/game-echo/details/${addedGame.file}`
            });
        }
        diskUsage = data.diskUsage;
        broadcast();
    });
    echoSocket.on('delete-game', async data => {
        console.log(`deleted game: ${data.file}`);
        await tracker.deleteGame(data.file);
        diskUsage = data.diskUsage;
        broadcast();
    });
    //on connection events make sure we're always up to date
    echoSocket.on('refresh', data => {
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