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
                
                socket.on('set', (id, isOn) => {
                    harbinger[isOn ? 'on' : 'off'](id)
                        .then(harbinger.getState.bind(harbinger))
                        .then(state => {
                            io.emit('states', state);
                        });
                })
            });
        }, err => {console.log(err);});
};