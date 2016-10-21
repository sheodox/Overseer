'use strict';
var harbinger = require('./harbinger');
module.exports = function(io) {
    harbinger
        .init()
        .then(() => {
            io.on('connection', socket => {
                socket.on('lights/refresh', () => {
                    harbinger.getState()
                        .then(state => {
                            socket.emit('lights/refresh', state);
                        });
                });

                function broadcastState() {
                    return harbinger
                        .getState()
                        .then(state => {
                            io.emit('lights/refresh', state);
                        });
                }

                socket.on('lights/toggle', id => {
                    harbinger.getState()
                        .then(state => {
                            var newState = state.reduce((done, next) => {
                                if (next.id === id) {
                                    done = !next.on;
                                }
                                return done;
                            }, '');
                            harbinger[newState ? 'on' : 'off'](id)
                                .then(broadcastState);
                        });
                });
                
                socket.on('lights/brightness', (id, newBrightness) => {
                    harbinger.setBrightness(id, newBrightness)
                        .then(broadcastState);
                })
            });
        }, err => {console.log(err);});
};