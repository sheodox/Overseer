import {Router, Response} from 'express';
import serializeJavascript from "serialize-javascript";
import {voterBooker, echoBooker} from "../db/booker";
import {isReqSuperUser} from "../util/superuser";
import {AppRequest} from "../types";
import {getManifest} from "../util/route-common";
import {users} from "../db/users";

const router = Router();

const overseerApps = {
    echo: 'Echo',
    voter: 'Voter',
};

/* GET home page for / and any client side routing urls */
router.get('/', entry());
for (const app of Object.keys(overseerApps)) {
    router.get(`/${app}`, entry(app));
    router.get(`/${app}/**`, entry(app));
}

function entry(app?: string) {
    return async function entry(req: AppRequest, res: Response) {
        const id = req.user ? req.user.id : null,
            permissions = serializeJavascript({
                voter: await voterBooker.getUserPermissions(id),
                echo: await echoBooker.getUserPermissions(id),
            }),
            links = [
                {href: '/auth/logout', text: 'Logout', icon: 'sign-out-alt'}
            ],
            manifest = await getManifest();

        if (id) {
            // don't need to wait for this to serve the page
            users.touch(id);
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
            description: 'LAN tools and home control.',
        };

        if (req.user) {
            res.render('index', {
                manifest,
                ...social,
                user: serializeJavascript({
                    id: req.user.id,
                    displayName: req.user.displayName,
                    profileImage: req.user.profileImage,
                    links
                }),
                permissions
            });
        } else {
            res.render('index', {
                manifest,
                ...social,
                user: serializeJavascript(false),
                permissions
            });
        }
    }
}

module.exports = router;
