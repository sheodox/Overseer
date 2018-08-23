const Conduit = require('../util/conduit');

module.exports = function(io) {
    io.on('connection', socket => {
        const settingsConduit = new Conduit(socket, 'settings');
    });
}
