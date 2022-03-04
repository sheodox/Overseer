import { Envoy } from '../../shared/envoy.js';
import { io } from '../server.js';

io.on('connection', (socket) => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const settingsEnvoy = new Envoy(socket, 'settings');
});
