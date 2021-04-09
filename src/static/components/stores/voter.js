import {writable, derived, get} from 'svelte/store';
import page from 'page';
import {applyChange} from "deep-diff";
import {socket} from "../../socket";
import {Conduit} from "../../../shared/conduit";
import {activeRouteParams} from "./routing";
import {uploadImage} from "./app";
const voterConduit = new Conduit(socket, 'voter');

export const voterInitialized = writable(false);

let untouchedVoterData;
export const voterRaces = writable([], () => {
    //if they don't have voter permissions, or they've already initialized, don't try and initialize anymore
    if (!Booker.voter.view || get(voterInitialized)) {
        return;
    }

    voterConduit.emit('init', races => {
        untouchedVoterData = races;
        setVoterData(races);
    });
});

voterConduit.on({
    diff: (changes) => {
        if (get(voterInitialized)) {
            for (const change of changes) {
                applyChange(untouchedVoterData, change);
            }
            setVoterData(untouchedVoterData);
        }
    }
})

function setVoterData(races) {
    const userId = window.user.id;

    voterRaces.set(races.map(race => {
        return {
            ...race,
            candidates: race.candidates.map(candidate => {
                const created = userId === candidate.creatorId;
                let voted = false;
                if (candidate.votedUp.includes(userId)) {
                    voted = 'up'
                }
                else if (candidate.votedDown.includes(userId)) {
                    voted = 'down'
                }
                return {
                    ...candidate,
                    voted,
                    created
                }
            })
        }
    }));
    voterInitialized.set(true);
}
export const voterSelectedRace = derived([voterRaces, activeRouteParams], ([races, params]) => {
    return races.find(({id}) => id === params.raceId)
});

export const voterOps = {
    race: {
        new: name => {
            voterConduit.emit('newRace', name, id => {
                page(`/voter/${id}`)
            });
        },
        delete: raceId => {
            voterConduit.emit('removeRace', raceId);
            page(`/voter`)
        },
        resetVotes: raceId => {
            voterConduit.emit('resetVotes', raceId);
        },
        rename: (raceId, name) => {
            voterConduit.emit('renameRace', raceId, name);
        }
    },
    candidate: {
        new: (raceId, name) => {
            voterConduit.emit('newCandidate', raceId, name);
        },
        vote: (candidateId, direction) => {
            voterConduit.emit('vote', candidateId, direction);
        },
        delete: (candidateId) => {
            voterConduit.emit('removeCandidate', candidateId);
        },
        update: (candidateId, name, notes) => {
            voterConduit.emit('updateCandidate', candidateId, name, notes);
        },
        uploadImage(candidateId, file) {
            uploadImage(
                'Voter Upload',
                file,
                `/voter/${candidateId}/upload`
            )
        },
        deleteImage: id => {
            voterConduit.emit('removeImage', id);
        }
    },
}

export function createRankedCandidateStore(raceStore, lockStore) {
    function findNewCandidates(newCandidates, oldCandidates) {
        return newCandidates.filter(({id}) => {
            return !oldCandidates.some(old => old.id === id);
        });
    }

    const store = writable([]),
        raceUnsubscribe = raceStore.subscribe(raceUpdate => {
            if (!raceUpdate) {
                return [];
            }
            const locked = get(lockStore);

            store.update(oldCandidates => {
                if (locked) {
                    const newCandidates = findNewCandidates(raceUpdate.candidates, oldCandidates);

                    oldCandidates = oldCandidates.map(candidate => {
                        const newVersionOfThisCandidate = raceUpdate.candidates.find(({id}) => id === candidate.id);

                        return newVersionOfThisCandidate ? newVersionOfThisCandidate : {
                            ...candidate,
                            deleted: true
                        };
                    })

                    return [
                        ...oldCandidates,
                        //add any new candidates to the bottom
                        ...newCandidates
                    ]
                }
                else {
                    return rankCandidates(raceUpdate);
                }
            })
        }),
        lockUnsubscribe = lockStore.subscribe(locked => {
            //when unlocked, immediately sort in case we deferred sorting until now
            if (!locked) {
                store.set(rankCandidates(get(raceStore) || {candidates: []}))
            }
        });

    return {
        subscribe: (subscription) => {
            const rankingUnsubscribe = store.subscribe(subscription)
            return  () => {
                rankingUnsubscribe();
                raceUnsubscribe();
                lockUnsubscribe();
            }
        },
    };
}

function weightedVotes(candidate) {
    return candidate.votedUp.length - (1.1 * candidate.votedDown.length);
}

export function rankCandidates(race) {
    if (!race) {
        return [];
    }
    return race.candidates.slice().sort((a, b) => {
        return weightedVotes(b) - weightedVotes(a);
    })
}

export function getRaceMaxVotes(race) {
    if (!race) {
        return 1;
    }
    return Math.max(
        ...(race.candidates.map(candidate => {
            return candidate.votedUp.length + candidate.votedDown.length
        }))
    );
}
