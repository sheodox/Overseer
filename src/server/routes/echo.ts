import { echo } from '../db/echo.js';
import { createSafeWebsocketHandler, Harbinger } from '../util/harbinger.js';
import { Socket } from 'socket.io';
import { Envoy } from '../../shared/envoy.js';
import { echoBooker } from '../db/booker.js';
import { AppRequest } from '../types.js';
import { tags as formatTags } from '../../shared/formatters.js';
import { createIntegrationToken, verifyIntegrationToken } from '../util/integrations.js';
import { v4 as uuid, validate as uuidValidate } from 'uuid';
import MarkdownIt from 'markdown-it';
import { echoIntegrationLogger, echoLogger } from '../util/logger.js';
import { safeAsyncRoute } from '../util/error-handler.js';
import { Response, Router } from 'express';
import deepdiff from 'deep-diff';
import { createNotificationsForPermittedUsers } from '../util/create-notifications.js';
import { internalServer, io, wss } from '../server.js';
import type { EchoData, EchoDiskUsage, EchoItemEditable, PreparedEchoItem } from '../../shared/types/echo';
import { IncomingMessage } from 'node:http';
import { WebSocket } from 'ws';

export const router = Router(),
	{ diff } = deepdiff;

const md = new MarkdownIt(),
	echoServerHost = process.env.ECHO_SERVER_HOST;

router.post(
	'/echo/:echoId/image-upload',
	safeAsyncRoute(async (req: AppRequest, res: Response, next) => {
		const contentType = req.get('Content-Type');
		if (req.user && (await echoBooker.check(req.user.id, 'add_image'))) {
			await echo.uploadImage(req.params.echoId, req.user.id, req.body, contentType);
			res.send(null);
			await broadcast();
		} else {
			next({ status: 401 });
		}
	})
);
const echoHarbinger = new Harbinger('echo');
let echoOnline = false,
	echoServerSocket: WebSocket,
	diskUsage: EchoDiskUsage;

let lastData: any; // this is the resolved data of getEchoData
getEchoData().then((data) => {
	lastData = data;
});

const awaitingEchoResponse = new Map<string, (data: any) => void>();

function sendToEcho(route: string, data: Record<string, any>, msgId?: string, done?: () => void) {
	if (!msgId) {
		msgId = uuid();
	}
	if (echoOnline) {
		echoServerSocket.send(JSON.stringify({ route, data, msgId }));

		if (done) {
			awaitingEchoResponse.set(msgId, done);
		}
	}
}

/**
 * Emit data about all games to all connected authorized clients
 */
async function broadcast() {
	const data = await getNewestEchoData(),
		changes = diff(lastData, data);

	lastData = data;

	echoHarbinger.filteredBroadcast('diff', async (userId: string) => {
		//if they're not logged in, don't even check permissions
		if (!userId) {
			return;
		}
		const allowed = await echoBooker.check(userId, 'view');
		if (allowed) {
			return changes;
		}
	});
}

async function getNewestEchoData(): Promise<EchoData> {
	const allTags: { [tag: string]: number } = {},
		items = await echo.list();

	items.forEach((item) => {
		formatTags(item.tags).forEach((tag) => {
			allTags[tag] = (allTags[tag] || 0) + 1;
		});
	});
	const sortableTags: { tag: string; count: number }[] = [];
	Object.keys(allTags).forEach((tag) => {
		sortableTags.push({ tag, count: allTags[tag] });
	});
	sortableTags.sort((a, b) => b.count - a.count);

	return {
		echoServerHost,
		tagCloud: sortableTags.map((countInfo) => countInfo.tag),
		items: items.map((item) => {
			return {
				...item,
				size: Number(item.size),
				path: `/echo/${item.id}`,
				editPath: `/echo/${item.id}/edit`,
				downloadUrl: `${echoServerHost}/download/${item.id}`,
				notesRendered: md.render(item.notes),
			};
		}) as PreparedEchoItem[],
		diskUsage,
		echoOnline: echoOnline,
	};
}

export async function createEchoDownloadToken(userId: string) {
	// if they're able to download things, give them a download token!
	if (await echoBooker.check(userId, 'download')) {
		const downloadToken = createIntegrationToken(`Echo download token for user ${userId}`, ['echo-download']);
		return downloadToken;
	}
}
export async function getEchoData() {
	if (!lastData) {
		lastData = await getNewestEchoData();
	}
	return lastData;
}

//connection to overseer clients
io.on('connection', (socket: Socket) => {
	const echoEnvoy = new Envoy(socket, 'echo'),
		userId = Harbinger.getUserId(socket);

	//don't attempt to let users who aren't signed in to connect to the websocket
	if (!userId) {
		return;
	}

	const checkPermission = createSafeWebsocketHandler(userId, echoBooker, socket, echoLogger);

	echoEnvoy.on({
		delete: checkPermission('delete', async (id: string) => {
			sendToEcho('delete', { id });
		}),
		init: checkPermission('view', async () => {
			echoEnvoy.emit('init', await getEchoData());
			const downloadToken = await createEchoDownloadToken(userId);
			if (downloadToken) {
				echoEnvoy.emit('downloadToken', downloadToken);
			}
		}),
		update: checkPermission('update', async (id, updatedData) => {
			await echo.update(id, updatedData);
			broadcast();
		}),
		new: checkPermission('upload', async (data, done) => {
			const item = await echo.new(data, userId);
			//tell echo it can expect an upload with this ID, it will deny uploads for anything it's not expecting
			sendToEcho('expect-upload', { id: item.id }, null, () => {
				done(item.id, `${echoServerHost}/upload/${item.id}`);
			});
			broadcast();
		}),
		updateFile: checkPermission('upload', async (id: string, data: EchoItemEditable, done) => {
			if (uuidValidate(id) && echoOnline) {
				await echo.updateFile(id, data);
				broadcast();
				//tell echo it can expect an upload with this ID, it will deny uploads for anything it's not expecting
				sendToEcho('expect-upload', { id }, null, () => {
					done(id, `${echoServerHost}/upload/${id}`);
				});
			}
		}),
		deleteImage: checkPermission('remove_image', async (id: string) => {
			await echo.deleteImage(id);
			broadcast();
		}),
	});
});

interface EchoServerWSMessage {
	route: string;
	msgId: string;
	data: Record<string, any>;
}

//connection to echo server
const echoListener = (socket: WebSocket) => {
	echoIntegrationLogger.info(`Echo server connection established`);
	echoOnline = true;
	broadcast();

	echoServerSocket = socket;
	echoServerSocket.on('close', () => {
		echoOnline = false;
		echoIntegrationLogger.info(`Echo server connection lost`);
		broadcast();
	});

	echoServerSocket.on('message', async (data) => {
		try {
			const msg = JSON.parse(data.toString()) as EchoServerWSMessage;

			if (awaitingEchoResponse.has(msg.msgId)) {
				awaitingEchoResponse.get(msg.msgId)(msg.data);
				awaitingEchoResponse.delete(msg.msgId);
				return;
			}

			if (msg.route === 'downloaded') {
				const id = msg.data.id;

				await echo.downloaded(id);
				broadcast();
			} else if (msg.route === 'deleted') {
				await echo.delete(msg.data.id);
				broadcast();
			} else if (msg.route === 'verify-download-token') {
				const token = msg.data.token,
					allowed = token && verifyIntegrationToken(token, 'echo-download');

				sendToEcho(
					'verify-download-token',
					{
						allowed,
						name: allowed ? (await echo.getItem(msg.data.id))?.name : '',
					},
					msg.msgId
				);
			} else if (msg.route === 'uploaded') {
				const { id, size } = msg.data as { id: string; size: number };
				//if it's a brand new game send a notification to everyone
				const uploadedItem = await echo.uploadFinished(id, {
					size: size,
				});

				createNotificationsForPermittedUsers(
					echoBooker,
					'view',
					{
						title: 'Echo',
						message: `"${uploadedItem.name}" was uploaded.`,
						href: `/echo/${uploadedItem.id}`,
					},
					'notifyEchoUploads'
				);
				broadcast();
			} else if (msg.route === 'disk-usage') {
				diskUsage = msg.data as EchoDiskUsage;
				broadcast();
			} else {
				echoLogger.warn(`No echo server handler found for "${msg.route}"!`);
			}
		} catch (error) {
			echoLogger.error('Error handling Echo websocket message', { error, data: data.toString() });
		}
	});
};

internalServer.on('upgrade', (req: IncomingMessage, socket, head) => {
	const token = req.headers.authorization?.replace('Bearer ', '');

	if (req.url === '/echo-server-ws' && verifyIntegrationToken(token, 'echo')) {
		wss.handleUpgrade(req, socket, head, (ws) => {
			echoListener(ws);
		});
	} else {
		socket.destroy();
	}
});
