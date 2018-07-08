const harbinger = require('./harbinger'),
    SilverConduit = require('./util/SilverConduit'),
    lightsBooker = require('./db/lightsbooker');

function listen(io) {
    const ioConduit = new SilverConduit(io, 'lights');
    io.on('connection', socket => {
        const socketConduit = new SilverConduit(socket, 'lights');
        const userId = SilverConduit.getUserId(socketConduit.socket);
        function broadcastState() {
            ioConduit.filteredBroadcast('refresh', async userId => {
                if (await lightsBooker.check(userId, 'use')) {
                    return harbinger.getState();
                }
            });
        }

        socketConduit.on({
            init: async () => {
                if (await lightsBooker.check(userId, 'use')) {
                    socketConduit.emit('refresh', harbinger.getState());
                }
            },
            toggle: async id => {
                if (await lightsBooker.check(userId, 'use')) {
                    harbinger.toggle(id);
                    broadcastState();
                }
            },
            brightness: async (id, newBrightness) => {
                if (await lightsBooker.check(userId, 'use')) {
                    harbinger.setBrightness(id, newBrightness);
                    broadcastState();
                }
            }
        });
    });
}

export default function(io) {
    harbinger
        .init()
        .then(() => {
            //the rest of the code is in 'listen' to reduce indenting
            listen(io);
        }, err => {console.log(err);});
};