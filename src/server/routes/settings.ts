import { Envoy } from '../../shared/envoy.js';
import { io } from '../server.js';

io.on('connection', (socket) => {
	const settingsEnvoy = new Envoy(socket, 'settings');
});
