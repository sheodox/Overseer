'use strict';
var harbinger = require('./harbinger');
module.exports = function(io) {
    harbinger
        .init()
        .then(() => {
            io.on('connection', socket => {
                harbinger.getState()
                    .then(state => {
                        socket.emit('states', state);
                    });
                
                socket.on('toggle', id => {
                    harbinger.getState()
                        .then(state => {
                            var newState = state.reduce((done, next) => {
                                if (next.id === id) {
                                    done = !next.on;
                                }
                                return done;
                            }, '');
                            harbinger[newState ? 'on' : 'off'](id)
                                .then(harbinger.getState.bind(harbinger))
                                .then(state => {
                                    io.emit('states', state);
                                });
                        });
                })
            });
        }, err => {console.log(err);});
};