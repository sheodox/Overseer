import {Server} from "socket.io";
import {Conduit} from "../../shared/conduit";

module.exports = function(io: Server) {
    io.on('connection', socket => {
        const settingsConduit = new Conduit(socket, 'settings');
    });
}
