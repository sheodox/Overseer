import { Server } from 'socket.io';
import { Envoy } from '../../shared/envoy';

module.exports = function (io: Server) {
	io.on('connection', (socket) => {
		const settingsEnvoy = new Envoy(socket, 'settings');
	});
};
