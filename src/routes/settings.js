import store from '../reducers/reducers';
import actions from '../actions/act-voter-server';
import User from '../users';

export default function(io) {
    io.on('connection', socket => {
        socket.on('settings/proposeUsername', (id, username) => {
            let newUser = User.register(id, username);
            if (newUser) {
                socket.emit('settings/usernameAccepted', newUser);
            }
            else {
                socket.emit('settings/usernameInvalid', username);
            }
        });
    });
}
