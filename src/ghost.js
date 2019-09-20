const harbinger = require('./harbinger'),
    SilverConduit = require('./util/SilverConduit'),
    lightsBooker = require('./db/lightsbooker'),
    config = require('./config.json'),
    router = require('express').Router();

function listen(io) {
    router.get('/lights/toggle/:id', (req, res) => {
        checkIfAllowedIP(req, res, () => {
            harbinger.toggle(req.params.id);
            broadcastState();
            res.send('toggled');
        });
    });

    router.post('/lights/toggle-several', (req, res) => {
        checkIfAllowedIP(req, res, () => {
            harbinger.toggleSeveral(req.body);
            broadcastState();
            res.send('toggled');
        });
    });
    
    const ioConduit = new SilverConduit(io, 'lights');
    function broadcastState() {
        ioConduit.filteredBroadcast('refresh', async userId => {
            if (await lightsBooker.check(userId, 'use')) {
                return harbinger.getState();
            }
        });
    }
    
    io.on('connection', socket => {
        const socketConduit = new SilverConduit(socket, 'lights');
        const userId = SilverConduit.getUserId(socketConduit.socket);

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

function checkIfAllowedIP(req, res, cb) {
    const ip = req.headers['x-real-ip'] || req.ip.replace('::ffff:', '');
    if ((config['trusted-light-switching-ips'] || []).includes(ip)) {
        cb();
    }
    else {
        res.send('not allowed');
    }
}

module.exports = function(io) {
    harbinger
        .init()
        .then(() => {
            //the rest of the code is in 'listen' to reduce indenting
            listen(io);
        }, err => {console.log(err);});
    
    return router;
};
