import winston from 'winston';
import Transport from 'winston-transport';

/*
Logging is collected and served behind the firewall and JWT
authorizations. This allows logs to be collected and aggregated
on my own hardware without needing to pay for a significantly
more expensive server tier that would have enough resources to
run something like the Elastic Stack.
 */
class RemoteTransport extends Transport {
	private logBuffer: any[] = [];

	constructor(opts?: any) {
		super(opts);
	}

	log(info: any, callback: () => void) {
		this.logBuffer.push(info);
		callback();
	}

	//get a batch of messages and clear it out, consider them to be consumed
	flushBuffer() {
		const logBatch = this.logBuffer;
		this.logBuffer = [];
		return logBatch;
	}
}

export const remoteTransport = new RemoteTransport();

const logger = winston.createLogger({
	level: process.env.LOG_LEVEL || 'info',
	format: winston.format.combine(
		winston.format.timestamp(),
		winston.format.errors({ stack: true }),
		winston.format((info) => {
			//enumerate Error object properties in a serializable way
			if (info.error instanceof Error) {
				info.error = Object.assign(
					{
						message: info.error.message,
						stack: info.error.stack,
					},
					info.error
				);
			}

			return info;
		})(),
		winston.format.json()
	),
	defaultMeta: {
		service: 'overseer',
	},
	transports: [new winston.transports.Console(), remoteTransport],
});

function createConcernLogger(concern: string) {
	return logger.child({
		concern,
	});
}

export const appLogger = createConcernLogger('app');
export const authLogger = createConcernLogger('auth');
export const httpLogger = createConcernLogger('http');
export const echoLogger = createConcernLogger('echo');
export const voterLogger = createConcernLogger('voter');
export const eventsLogger = createConcernLogger('events');
export const adminLogger = createConcernLogger('admin');
export const integrationsLogger = createConcernLogger('integrations');
export const echoIntegrationLogger = createConcernLogger('echo-integration');
