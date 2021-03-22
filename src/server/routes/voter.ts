import {Server} from "socket.io";
import {SilverConduit} from "../util/silver-conduit";
import {voterBooker} from "../db/booker";
import {voter} from '../db/voter';
import {AppRequest, ToastOptions} from "../types";
import {Router, Response} from "express";
import {maskVoterSessions} from "../util/maskVoterSessions";
import {users} from "../db/users";

const router = Router();

module.exports = function(io: Server) {
    const ioConduit = new SilverConduit(io, 'voter'),
        notificationConduit = new SilverConduit(io, 'notifications');

    router.post('/voter/:candidateId/upload', async (req: AppRequest, res: Response) => {
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
    });

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

    io.on('connection', socket => {
        const socketConduit = new SilverConduit(socket, 'voter'),
            singleUserNotifications = new SilverConduit(socket, 'notifications');
        let userId: string, displayName: string;

        const singleUserError = (message: string) => {
            singleUserNotifications.emit('notification', {
                variant: 'error',
                title: 'Voter Error',
                message,
            } as ToastOptions);
        };

        socketConduit.on({
            init: async () => {
                const user = (await users.getUser(SilverConduit.getUserId(socket)));
                userId = user.id
                displayName = user.displayName;

                if (await voterBooker.check(userId, 'view')) {
                    const raceData = await voter.list();
                    socketConduit.emit('refresh', await maskVoterSessions(raceData, userId));
                }
            },
            newRace: async (name: string) => {
                if (await voterBooker.check(userId, 'add_race')) {
                    const raceData = await voter.addRace(name, userId);

                    if ('error' in raceData) {
                        singleUserError(raceData.error);
                    }
                    else {
                        broadcast();
                        notificationBroadcast({
                            variant: 'info',
                            title: 'Voter - New Race',
                            message: `A new race "${raceData.name}" was added to Voter by ${displayName}!`,
                            href: `/voter/${raceData.id}`
                        });
                    }
                }
            },
            newCandidate: async (raceId: string, candidateName: string) => {
                if (await voterBooker.check(userId, 'add_candidate')) {
                    //overwrite name with the cleaned name from the tracker
                    const candidate = await voter.addCandidate(raceId, candidateName, userId);

                    if ('error' in candidate) {
                        singleUserError(candidate.error);
                    }
                    else {
                        broadcast();

                        const {name: raceName} = (await voter.getRaceById(raceId));
                        notificationBroadcast({
                            variant: 'info',
                            title: `Voter - ${raceName}`,
                            message: `${displayName} added "${candidate.name}"!`,
                            href: `/voter/${raceId}`
                        });
                    }
                }
            },
            vote: async (candidateId, direction) => {
                console.log('voting!', {candidateId, direction})
                if (await voterBooker.check(userId, 'vote')) {
                    if (direction === null) {
                        await voter.clearVote(candidateId, userId);
                    }
                    else {
                        await voter.vote(candidateId, userId, direction);
                    }
                    broadcast();
                }
            },
            removeCandidate: async (candidateId) => {
                const creatorId = await voter.getCandidateCreator(candidateId);

                //allow users to delete their own candidates
                if (creatorId === userId || await voterBooker.check(userId, 'remove_candidate')) {
                    await voter.removeCandidate(candidateId);
                    broadcast();
                }
            },
            removeRace: async raceId => {
                if (await voterBooker.check(userId, 'remove_race')) {
                    await voter.removeRace(raceId);
                    broadcast();
                }
            },
            renameRace: async (raceId, name) => {
                if (await voterBooker.check(userId, 'rename_race')) {
                    await voter.renameRace(raceId, name);
                    broadcast()
                }
            },
            resetVotes: async raceId => {
                if (await voterBooker.check(userId, 'reset_votes')) {
                    await voter.resetVotes(raceId);
                    broadcast();
                }
            },
            removeImage: async imageId => {
                if (await voterBooker.check(userId, 'remove_image')) {
                    await voter.removeImage(imageId);
                    broadcast();
                }
            },
            updateCandidate: async (candidateId, name, notes) => {
                if (await voterBooker.check(userId, 'update_candidate')) {
                    const result = await voter.updateCandidate(candidateId, name, notes);

                    if ('error' in result) {
                        singleUserError(result.error);
                    }
                    else {
                        broadcast();
                    }
                }
            }
        });
    });
    return router;
};
