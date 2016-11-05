import harbinger from './harbinger';
import store from './reducers/reducers';
import actions from './actions/act-lights-server';

function listen(io) {
    io.on('connection', socket => {
        function broadcastState() {
            const lightState = store.getState().lights;
            io.emit('lights/refresh', lightState);
        }

        socket.on('lights/toggle', id => {
            store.dispatch(actions.toggle(id));
            broadcastState();
        });

        socket.on('lights/brightness', (id, newBrightness) => {
            store.dispatch(actions.brightness(id, newBrightness));
            broadcastState();
        })
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