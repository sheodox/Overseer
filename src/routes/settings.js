import User from '../users';
const Conduit = require('../util/conduit');

export default function(io) {
    io.on('connection', socket => {
        const settingsConduit = new Conduit(socket, 'settings');
        settingsConduit.on({
            propose: (id, username, ack) => {
                ack(User.register(id, username));
            }
        });
    });
}
