import { writable, derived, get, Readable } from 'svelte/store';
import page from 'page';
import { applyChange } from 'deep-diff';
import { socket } from '../../socket';
import { Envoy } from '../../../shared/envoy';
import { activeRouteParams } from './routing';
import { appBootstrap, uploadImage, booker, user } from './app';
import { MaskedRace, MaskedCandidate, VoterData } from '../../../shared/types/voter';
const voterEnvoy = new Envoy(socket, 'voter', true);

const initialVoterData = appBootstrap.initialData.voter;
export const voterInitialized = writable(!!initialVoterData);

let untouchedVoterData: VoterData;
export const voterRaces = writable([], () => {
	//if they don't have voter permissions, or they've already initialized, don't try and initialize anymore
	if (!booker.voter.view || get(voterInitialized)) {
		return;
	}

	voterEnvoy.emit('init');
});

if (initialVoterData) {
	untouchedVoterData = initialVoterData;
	setVoterData(initialVoterData);
}

voterEnvoy.on({
	init: (races) => {
		untouchedVoterData = races;
		setVoterData(races);
	},
	diff: (changes) => {
		if (get(voterInitialized)) {
			for (const change of changes) {
				applyChange(untouchedVoterData, null, change);
			}
			setVoterData(untouchedVoterData);
		}
	},
});

function setVoterData(races: VoterData) {
	const userId = user.id;

	voterRaces.set(
		races.map((race) => {
			return {
				...race,
				candidates: race.candidates.map((candidate) => {
					const created = userId === candidate.creatorId;
					let voted: false | 'up' | 'down' = false;
					if (candidate.votedUp.includes(userId)) {
						voted = 'up';
					} else if (candidate.votedDown.includes(userId)) {
						voted = 'down';
					}
					return {
						...candidate,
						voted,
						created,
					};
				}),
			};
		})
	);
	voterInitialized.set(true);
}
export const voterSelectedRace = derived<any, MaskedRace>([voterRaces, activeRouteParams], ([races, params]) => {
	return races.find(({ id }: { id: string }) => id === params.raceId);
});

export const voterOps = {
	race: {
		new: (name: string) => {
			voterEnvoy.emit('newRace', name);
		},
		delete: (raceId: string) => {
			voterEnvoy.emit('removeRace', raceId);
			page(`/voter`);
		},
		resetVotes: (raceId: string) => {
			voterEnvoy.emit('resetVotes', raceId);
		},
		rename: (raceId: string, name: string) => {
			voterEnvoy.emit('renameRace', raceId, name);
		},
		unbanAll: (raceId: string) => {
			voterEnvoy.emit('unbanAll', raceId);
		},
	},
	candidate: {
		new: (raceId: string, name: string) => {
			voterEnvoy.emit('newCandidate', raceId, name);
		},
		vote: (candidateId: string, direction: string) => {
			voterEnvoy.emit('vote', candidateId, direction);
		},
		delete: (candidateId: string) => {
			voterEnvoy.emit('removeCandidate', candidateId);
		},
		update: (candidateId: string, name: string, notes: string) => {
			voterEnvoy.emit('updateCandidate', candidateId, name, notes);
		},
		ban: (candidateId: string) => {
			voterEnvoy.emit('banCandidate', candidateId);
		},
		unban: (candidateId: string) => {
			voterEnvoy.emit('unbanCandidate', candidateId);
		},
		uploadImage(candidateId: string, file: File) {
			uploadImage('Voter Upload', file, `/voter/${candidateId}/upload`);
		},
		deleteImage: (id: string) => {
			voterEnvoy.emit('removeImage', id);
		},
	},
};

export const filteredOutVoters = writable<string[]>([]);

export function createRankedCandidateStore(
	raceStore: Readable<MaskedRace>,
	lockStore: Readable<boolean>
): Readable<MaskedCandidate[]> {
	function findNewCandidates(newCandidates: MaskedCandidate[], oldCandidates: MaskedCandidate[]) {
		return newCandidates.filter(({ id }) => {
			return !oldCandidates.some((old) => old.id === id);
		});
	}

	const store = writable([]),
		raceUnsubscribe = raceStore.subscribe((raceUpdate) => {
			if (!raceUpdate) {
				return [];
			}
			const locked = get(lockStore);

			store.update((oldCandidates) => {
				if (locked) {
					const newCandidates = findNewCandidates(raceUpdate.candidates, oldCandidates);

					oldCandidates = oldCandidates.map((candidate) => {
						const newVersionOfThisCandidate = raceUpdate.candidates.find(({ id }) => id === candidate.id);

						return newVersionOfThisCandidate
							? newVersionOfThisCandidate
							: {
									...candidate,
									deleted: true,
							  };
					});

					return filterVoters(
						[
							...oldCandidates,
							//add any new candidates to the bottom
							...newCandidates,
						],
						get(filteredOutVoters)
					);
				} else {
					return rankCandidates(raceUpdate, get(filteredOutVoters));
				}
			});
		}),
		filteredOutVotersUnsubscribe = filteredOutVoters.subscribe((voters) => {
			store.set(rankCandidates(get(raceStore) || { candidates: [] }, voters));
		}),
		lockUnsubscribe = lockStore.subscribe((locked) => {
			//when unlocked, immediately sort in case we deferred sorting until now
			if (!locked) {
				store.set(rankCandidates(get(raceStore) || { candidates: [] }, get(filteredOutVoters)));
			}
		});

	return {
		subscribe: (subscription: any) => {
			const rankingUnsubscribe = store.subscribe(subscription);
			return () => {
				rankingUnsubscribe();
				filteredOutVotersUnsubscribe();
				raceUnsubscribe();
				lockUnsubscribe();
			};
		},
	};
}

function weightedVotes(candidate: MaskedCandidate) {
	// always show banned candidates beneath everything else, they're not even an option
	if (candidate.banned) {
		return -Infinity;
	}

	return candidate.votedUp.length - 1.1 * candidate.votedDown.length;
}

function filterVoters(candidates: MaskedCandidate[], filteredOutVoters: string[]) {
	const filterOut = (vote: string) => !filteredOutVoters.includes(vote);

	return candidates.slice().map((candidate) => {
		const votedUp = candidate.votedUp.filter(filterOut),
			votedDown = candidate.votedDown.filter(filterOut);
		return { ...candidate, votedUp, votedDown };
	});
}

export function rankCandidates(race: { candidates: MaskedCandidate[] }, filteredOutVoters: string[]) {
	if (!race) {
		return [];
	}

	return filterVoters(race.candidates, filteredOutVoters).sort((a, b) => {
		return weightedVotes(b) - weightedVotes(a);
	});
}

export function getRaceMaxVotes(candidates: MaskedCandidate[]) {
	return Math.max(
		1, // there at least should be one vote, without this it'll try and divide by zero when getting a percentage
		...candidates.map((candidate) => {
			return candidate.votedUp.length + candidate.votedDown.length;
		})
	);
}
