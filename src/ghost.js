const harbinger = require('./harbinger'),
    SilverConduit = require('./util/SilverConduit'),
    lightsBooker = require('./db/lightsbooker'),
    config = require('./config.json'),
    router = require('express').Router();

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

router.get('/lights/toggle/:id', (req, res) => {
    const ip = req.ip.replace('::ffff:', '');
    if ((config['trusted-light-switching-ips'] || []).includes(ip)) {
        harbinger.toggle(req.params.id);
        res.send('toggled');
    }
    else {
        res.send();
    }
});

module.exports = function(io) {
    harbinger
        .init()
        .then(() => {
            //the rest of the code is in 'listen' to reduce indenting
            listen(io);
        }, err => {console.log(err);});
    
    return router;
};
