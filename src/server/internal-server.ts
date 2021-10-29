/*
This file runs on a port that's not exposed outside of the firewall.

This can be used to expose things like metrics to prometheus.
 */
import express from 'express';
import { remoteTransport } from './util/logger';
import { requestId } from './util/request-id';
import { verifyIntegrationToken } from './util/integrations';
import { errorHandler } from './util/error-handler';
import { AppRequest } from './types';

const app = express();
app.use(requestId);

function getTokenFromRequest(req: AppRequest) {
	return req.header('Authorization')?.replace('Bearer ', '');
}

app.get('/logs', (req: AppRequest, res, next) => {
	const token = getTokenFromRequest(req);

	if (verifyIntegrationToken(token, 'logs')) {
		res.json(remoteTransport.flushBuffer());
	} else {
		next({ status: 401 });
	}
});

app.use((req, res, next) => {
	next({ status: 404 });
});
app.use(errorHandler(true));

app.listen(4001);
