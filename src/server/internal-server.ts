/*
This file runs on a port that's not exposed outside of the firewall.

This can be used to expose things like metrics to prometheus.
 */
import { remoteTransport } from './util/logger.js';
import { requestId } from './util/request-id.js';
import { verifyIntegrationToken } from './util/integrations.js';
import { errorHandler } from './util/error-handler.js';
import { AppRequest } from './types.js';
import { internalServer, internalServerApp } from './server.js';

internalServerApp.use(requestId);

function getTokenFromRequest(req: AppRequest) {
	return req.header('Authorization')?.replace('Bearer ', '');
}

internalServerApp.get('/logs', (req: AppRequest, res, next) => {
	const token = getTokenFromRequest(req);

	if (verifyIntegrationToken(token, 'logs')) {
		res.json(remoteTransport.flushBuffer());
	} else {
		next({ status: 401 });
	}
});

internalServerApp.get('/', (req, res) => {
	// respond to / with a success for health checks
	res.send('ok');
});

internalServerApp.use((req, res, next) => {
	next({ status: 404 });
});
internalServerApp.use(errorHandler(true));

internalServer.listen(4001);
