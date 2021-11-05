import { Router, Response } from 'express';
import serializeJavascript from 'serialize-javascript';
import { voterBooker, echoBooker, eventsBooker, appBooker } from '../db/booker.js';
import { isReqSuperUser } from '../util/superuser.js';
import { AppRequest } from '../types.js';
import { getManifest } from '../util/route-common.js';
import { users } from '../db/users.js';
import { safeAsyncRoute } from '../util/error-handler.js';
import { prisma } from '../db/prisma.js';
import { vapidMetadataKeys } from '../util/create-notifications.js';
import { createEchoDownloadToken, getEchoData } from './echo.js';
import { getVoterData } from './voter.js';
import { getEventsData } from './events.js';

export const router = Router();

const overseerApps = {
	events: 'Events',
	echo: 'Echo',
	voter: 'Voter',
	settings: 'Settings',
};

/* GET home page for / and any client side routing urls */
router.get('/', entry());
for (const app of Object.keys(overseerApps)) {
	router.get(`/${app}`, entry(app));
	router.get(`/${app}/**`, entry(app));
}

function entry(app?: string) {
	return safeAsyncRoute(async function entry(req: AppRequest, res: Response) {
		const id = req.user ? req.user.id : null,
			permissions = {
				voter: await voterBooker.getUserPermissions(id),
				echo: await echoBooker.getUserPermissions(id),
				events: await eventsBooker.getUserPermissions(id),
				app: await appBooker.getUserPermissions(id),
			},
			links = [{ href: '/auth/logout', text: 'Logout', icon: 'sign-out-alt' }];
		let settings;

		if (id) {
			// don't need to wait for this to serve the page
			users.touch(id);
			settings = await users.getSettings(id);
		}

		if (isReqSuperUser(req)) {
			links.push({
				text: 'Admin',
				href: '/admin',
				icon: 'user-lock',
			});
		}

		//add the module name for social meta
		const moduleName = overseerApps[app as keyof typeof overseerApps];

		const social = {
			title: (moduleName ? `${moduleName} - ` : '') + 'Overseer',
			site: 'Overseer',
			module: moduleName,
			description: 'Overseer is a LAN control center!',
		};

		const { cssImports, scriptEntryFile } = await getManifest('src/static/main.ts');

		// locals that get set regardless of if you're logged in, these are
		// build asset related generally
		const commonLocals = {
			development: process.env.NODE_ENV === 'development',
			//scriptImports,
			scriptEntryFile,
			cssImports,
		};

		if (req.user) {
			const publicKey = await prisma.appMetadata.findFirst({
				where: {
					key: vapidMetadataKeys.publicKey,
				},
			});

			const userId = req.user.id,
				canView = {
					echo: await echoBooker.check(userId, 'view'),
					voter: await voterBooker.check(userId, 'view'),
					events: await eventsBooker.check(userId, 'view'),
				};

			res.render('index', {
				...commonLocals,
				...social,
				appBootstrap: serializeJavascript({
					booker: permissions,
					user: {
						id: req.user.id,
						displayName: req.user.displayName,
						profileImage: req.user.profileImage,
						links,
						settings,
					},
					initialData: {
						echo: canView.echo && (await getEchoData()),
						// not checking booker here, it's checked by createEchoDownloadToken
						echoDownloadToken: await createEchoDownloadToken(req.user.id),
						voter: canView.voter && (await getVoterData()),
						events: canView.events && (await getEventsData(req.user.id)),
					},
					serverMetadata: {
						pushVapidPublicKey: publicKey?.value,
					},
				}),
			});
		} else {
			res.render('index', {
				...commonLocals,
				...social,
				appBootstrap: serializeJavascript({
					user: false,
					serverMetadata: {},
					initialData: {},
					booker: permissions,
				}),
			});
		}
	});
}
