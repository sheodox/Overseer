const harbinger = require('./harbinger'),
    Conduit = require('./util/conduit');

function listen(io) {
    io.on('connection', socket => {
        const socketConduit = new Conduit(socket, 'lights');
        const ioConduit = new Conduit(io, 'lights');
        function broadcastState() {
            const lightState = harbinger.getState();
            ioConduit.emit('refresh', lightState);
        }

        socketConduit.on({
            init: () => {
                socketConduit.emit('refresh', harbinger.getState());
            },
            toggle: id => {
                harbinger.toggle(id);
                broadcastState();
            },
            brightness: (id, newBrightness) => {
                harbinger.setBrightness(id, newBrightness);
                broadcastState();
            }
        });
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