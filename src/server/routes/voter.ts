import {createSafeWebsocketHandler, Harbinger} from "../util/harbinger";
import {voterBooker} from "../db/booker";
import {voter} from '../db/voter';
import {AppRequest, ToastOptions} from "../types";
import {Router, Response} from "express";
import {MaskedRace, maskVoterSessions} from "../util/maskVoterSessions";
import {users} from "../db/users";
import {safeAsyncRoute} from "../util/error-handler";
import {voterLogger} from "../util/logger";
import {diff} from "deep-diff";
import {Envoy} from "../../shared/envoy";
import {broadcastToast, sendToastToUser} from "../util/create-notifications";
import {io} from '../server';

export const router = Router();

//cache what the races used to be, so we can get a diff of minimal changes to broadcast to
//users for easy and efficient updates
let lastData: MaskedRace[];

const getNewestVoterData = async () => await maskVoterSessions(await voter.list());
export const getVoterData = async () => {
	if (!lastData) {
		lastData = await getNewestVoterData();
	}
	return lastData;
};

const voterHarbinger = new Harbinger('voter');

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
	const data = await getNewestVoterData(),
		changes = diff(lastData, data);

	lastData = data;

	voterHarbinger.filteredBroadcast('diff', async userId => {
		if (await voterBooker.check(userId, 'view')) {
			return changes;
		}
	});
}
async function notificationBroadcast(notificationData: ToastOptions) {
	broadcastToast(async userId => {
		if (await voterBooker.check(userId, 'view')) {
			return notificationData;
		}
	});
}

io.on('connection', async socket => {
	const voterEnvoy = new Envoy(socket, 'voter'),
		userId = Harbinger.getUserId(socket);

	//don't attempt to let users who aren't signed in to connect to the websocket
	if (!userId) {
		return;
	}

	const user = await users.getUser(userId),
		displayName = user.displayName,
		checkPermission = createSafeWebsocketHandler(userId, voterBooker, socket, voterLogger);

	const singleUserError = (message: string) => {
		sendToastToUser(userId, {
			variant: 'error',
			title: 'Voter Error',
			message,
		});
	};

	voterEnvoy.on({
		init: checkPermission('view', async (done) => {
			done(await getVoterData());
		}),
		newRace: checkPermission('add_race', async (name: string, done) => {
			const raceData = await voter.addRace(name, userId);

			if ('error' in raceData) {
				singleUserError(raceData.error);
			} else {
				done(raceData.id);
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
