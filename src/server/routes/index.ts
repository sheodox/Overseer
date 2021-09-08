import {Router, Response} from 'express';
import serializeJavascript from "serialize-javascript";
import {voterBooker, echoBooker, eventsBooker, appBooker} from "../db/booker";
import {isReqSuperUser} from "../util/superuser";
import {AppRequest} from "../types";
import {getManifest} from "../util/route-common";
import {users} from "../db/users";
import {safeAsyncRoute} from "../util/error-handler";
import {prisma} from "../db/prisma";
import {vapidMetadataKeys} from "../util/create-notifications";
import { createEchoDownloadToken, getEchoData } from './echo';
import { getVoterData } from './voter';
import { getEventsData } from './events';

const router = Router();

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
            permissions = serializeJavascript({
                voter: await voterBooker.getUserPermissions(id),
                echo: await echoBooker.getUserPermissions(id),
                events: await eventsBooker.getUserPermissions(id),
                app: await appBooker.getUserPermissions(id),
            }),
            links = [
                {href: '/auth/logout', text: 'Logout', icon: 'sign-out-alt'}
            ],
            manifest = await getManifest();
        let settings;

        if (id) {
            // don't need to wait for this to serve the page
            users.touch(id);
            settings = await users.getSettings(id);
        }

        if (isReqSuperUser(req)) {
            links.push({
                text: 'Admin', href: '/admin', icon: 'user-lock'
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

        if (req.user) {
            const publicKey = await prisma.appMetadata.findFirst({
                where: {
                    key: vapidMetadataKeys.publicKey
                }
            });

			const userId = req.user.id,
				canView = {
					echo: await echoBooker.check(userId, 'view'),
					voter: await voterBooker.check(userId, 'view'),
					events: await eventsBooker.check(userId, 'view'),
				};

            res.render('index', {
                manifest,
                ...social,
                user: serializeJavascript({
                    id: req.user.id,
                    displayName: req.user.displayName,
                    profileImage: req.user.profileImage,
                    links,
                    settings
                }),
				initialData: serializeJavascript({
					echo: canView.echo && await getEchoData(),
					// not checking booker here, it's checked by createEchoDownloadToken
					echoDownloadToken: await createEchoDownloadToken(req.user.id),
					voter: canView.voter && await getVoterData(),
					events: canView.events && await getEventsData(req.user.id),
				}),
                serverMetadata: serializeJavascript({
                    pushVapidPublicKey: publicKey?.value
                }),
                permissions
            });
        } else {
            res.render('index', {
                manifest,
                ...social,
                user: serializeJavascript(false),
                serverMetadata: serializeJavascript({}),
				initialData: serializeJavascript({}),
                permissions
            });
        }
    })
}

module.exports = router;
