import { echo } from '../db/echo.js';
import { createSafeWebsocketHandler, Harbinger } from '../util/harbinger.js';
import { Server, Socket } from 'socket.io';
import { Envoy } from '../../shared/envoy.js';
import { echoBooker } from '../db/booker.js';
import { AppRequest, ToastOptions } from '../types.js';
import { tags as formatTags } from '../../shared/formatters.js';
import { createIntegrationToken, verifyIntegrationToken } from '../util/integrations.js';
import { validate as uuidValidate } from 'uuid';
import MarkdownIt from 'markdown-it';
import { echoIntegrationLogger, echoLogger } from '../util/logger.js';
import { safeAsyncRoute } from '../util/error-handler.js';
import { Response, Router } from 'express';
import deepdiff from 'deep-diff';
import { createNotificationsForPermittedUsers } from '../util/create-notifications.js';
import { io } from '../server.js';
import type { EchoData, EchoDiskUsage, EchoItemEditable, PreparedEchoItem } from '../../shared/types/echo';

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
let echoOnline = false,
	echoHarbinger = new Harbinger('echo'),
	echoServerSocket: Socket,
	diskUsage: EchoDiskUsage;

let lastData: any; // this is the resolved data of getEchoData
getEchoData().then((data) => {
	lastData = data;
});
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
			echoServerSocket.emit('delete', id, async () => {
				await echo.delete(id);
				broadcast();
			});
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
			echoServerSocket.emit('expect-upload', item.id, () => {
				done(item.id, `${echoServerHost}/upload/${item.id}`);
			});
			broadcast();
		}),
		updateFile: checkPermission('upload', async (id: string, data: EchoItemEditable, done) => {
			if (uuidValidate(id) && echoOnline) {
				await echo.updateFile(id, data);
				broadcast();
				//tell echo it can expect an upload with this ID, it will deny uploads for anything it's not expecting
				echoServerSocket.emit('expect-upload', id, () => {
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

//connection to echo server
const echoListener = (socket: Socket) => {
	echoIntegrationLogger.info(`Echo server connection established`);
	echoOnline = true;
	broadcast();

	function safeHandler(handler: (...args: any) => Promise<any>) {
		return async (...args: any) => {
			try {
				await handler(...args);
			} catch (error) {
				echoIntegrationLogger.error('Echo server error!', {
					error,
				});
			}
		};
	}

	echoServerSocket = socket;
	echoServerSocket.on('disconnect', () => {
		echoOnline = false;
		echoIntegrationLogger.info(`Echo server connection lost`);
		broadcast();
	});

	echoServerSocket.on(
		'verify-download-token',
		safeHandler(async (token, id, done) => {
			const allowed = token && verifyIntegrationToken(token, 'echo-download');

			done({
				allowed,
				name: allowed ? (await echo.getItem(id))?.name : '',
			});
		})
	);

	echoServerSocket.on(
		'downloaded',
		safeHandler(async (id) => {
			await echo.downloaded(id);
			broadcast();
		})
	);

	echoServerSocket.on(
		'uploaded',
		safeHandler(async (id, data) => {
			//if it's a brand new game send a notification to everyone
			const uploadedItem = await echo.uploadFinished(id, data);

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
		})
	);

	//on connection events make sure we're always up to date
	echoServerSocket.on(
		'refresh',
		safeHandler(async (data) => {
			diskUsage = data.diskUsage;
			broadcast();
		})
	);
};

io.of((name, query, next) => {
	if (name === '/echo-server') {
		//only allow clients with a valid signed JWT token to connect to this
		next(null, verifyIntegrationToken(query.token, 'echo'));
	} else {
		next(null, true);
	}
}).on('connection', (socket: Socket) => {
	echoListener(socket);
});
