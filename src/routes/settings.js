import Users from '../users';
const Conduit = require('../util/conduit');

export default function(io) {
    io.on('connection', socket => {
        const settingsConduit = new Conduit(socket, 'settings');
    });
}
