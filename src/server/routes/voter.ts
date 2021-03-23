import {Server} from "socket.io";
import {createSafeWebsocketHandler, SilverConduit} from "../util/silver-conduit";
import {voterBooker} from "../db/booker";
import {voter} from '../db/voter';
import {AppRequest, ToastOptions} from "../types";
import {Router, Response} from "express";
import {maskVoterSessions} from "../util/maskVoterSessions";
import {users} from "../db/users";
import {safeAsyncRoute} from "../util/error-handler";
import {voterLogger} from "../util/logger";

const router = Router();

module.exports = function(io: Server) {
    const ioConduit = new SilverConduit(io, 'voter'),
        notificationConduit = new SilverConduit(io, 'notifications');

    router.post('/voter/:candidateId/upload', safeAsyncRoute(async (req: AppRequest, res: Response, next) => {
        const contentType = req.get('Content-Type');
        //don't save data of the wrong content type
        if (req.user && await voterBooker.check(req.user.id, 'add_image')) {
            await voter.uploadImage(
                req.params.candidateId,
                req.user.id,
                req.body,
                contentType
            );
            res.send(null);
            await broadcast();
        }
        else {
            next({status: 401})
        }
    }));

    async function broadcast() {
        const raceData = await voter.list();
        ioConduit.filteredBroadcast('refresh', async userId => {
            if (await voterBooker.check(userId, 'view')) {
                return await maskVoterSessions(raceData, userId);
            }
        });
    }
    async function notificationBroadcast(notificationData: ToastOptions) {
        notificationConduit.filteredBroadcast('notification', async user_id => {
            if (await voterBooker.check(user_id, 'view')) {
                return notificationData;
            }
        });
    }

    io.on('connection', async socket => {
        const socketConduit = new SilverConduit(socket, 'voter'),
            singleUserNotifications = new SilverConduit(socket, 'notifications'),
            userId = SilverConduit.getUserId(socket);

        //don't attempt to let users who aren't signed in to connect to the websocket
        if (!userId) {
            return;
        }

        const user = await users.getUser(userId),
            displayName = user.displayName,
            checkPermission = createSafeWebsocketHandler(userId, voterBooker, socket, voterLogger);

        const singleUserError = (message: string) => {
            singleUserNotifications.emit('notification', {
                variant: 'error',
                title: 'Voter Error',
                message,
            } as ToastOptions);
        };

        socketConduit.on({
            init: checkPermission('view', async () => {
                const raceData = await voter.list();
                socketConduit.emit('refresh', await maskVoterSessions(raceData, userId));
            }),
            newRace: checkPermission('add_race', async (name: string) => {
                const raceData = await voter.addRace(name, userId);

                if ('error' in raceData) {
                    singleUserError(raceData.error);
                } else {
                    broadcast();
                    notificationBroadcast({
                        variant: 'info',
                        title: 'Voter - New Race',
                        message: `A new race "${raceData.name}" was added to Voter by ${displayName}!`,
                        href: `/voter/${raceData.id}`
                    });
                }
            }),
            newCandidate: checkPermission('add_candidate', async (raceId: string, candidateName: string) => {
                //overwrite name with the cleaned name from the tracker
                const candidate = await voter.addCandidate(raceId, candidateName, userId);

                if ('error' in candidate) {
                    singleUserError(candidate.error);
                } else {
                    broadcast();

                    const {name: raceName} = (await voter.getRaceById(raceId));
                    notificationBroadcast({
                        variant: 'info',
                        title: `Voter - ${raceName}`,
                        message: `${displayName} added "${candidate.name}"!`,
                        href: `/voter/${raceId}`
                    });
                }
            }),
            vote: checkPermission('vote', async (candidateId, direction) => {
                if (direction === null) {
                    await voter.clearVote(candidateId, userId);
                } else {
                    await voter.vote(candidateId, userId, direction);
                }
                broadcast();
            }),
            removeCandidate: async (candidateId) => {
                const creatorId = await voter.getCandidateCreator(candidateId);

                //allow users to delete their own candidates
                if (creatorId === userId || await voterBooker.check(userId, 'remove_candidate')) {
                    await voter.removeCandidate(candidateId);
                    broadcast();
                }
            },
            removeRace: checkPermission('remove_race', async raceId => {
                await voter.removeRace(raceId);
                broadcast();
            }),
            renameRace: checkPermission('rename_race', async (raceId, name) => {
                await voter.renameRace(raceId, name);
                broadcast()
            }),
            resetVotes: checkPermission('reset_votes', async raceId => {
                await voter.resetVotes(raceId);
                broadcast();
            }),
            removeImage: checkPermission('remove_image', async imageId => {
                await voter.removeImage(imageId);
                broadcast();
            }),
            updateCandidate: checkPermission('update_candidate', async (candidateId, name, notes) => {
                if (await voterBooker.check(userId, 'update_candidate')) {
                    const result = await voter.updateCandidate(candidateId, name, notes);

                    if ('error' in result) {
                        singleUserError(result.error);
                    } else {
                        broadcast();
                    }
                }
            })
        });
    });
    return router;
};
