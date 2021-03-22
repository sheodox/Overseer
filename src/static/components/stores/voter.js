import {writable, derived, get} from 'svelte/store';
import {post} from 'axios';
import {createProgressToast, createAutoExpireToast, updateToast} from 'sheodox-ui';
import {socket} from "../../socket";
import {Conduit} from "../../../shared/conduit";
import {activeRouteParams} from "./routing";
import {bytes as formatBytes} from "../../../shared/formatters";
const voterConduit = new Conduit(socket, 'voter');

export const voterInitialized = writable(false);
export const voterRaces = writable([], () => {
    if (!Booker.voter.view) {
        return;
    }

    voterConduit.emit('init');
});
export const voterSelectedRace = derived([voterRaces, activeRouteParams], ([races, params]) => {
    return races.find(({id}) => id === params.raceId)
});

export const voterOps = {
    race: {
        new: name => {
            voterConduit.emit('newRace', name);
        },
        delete: raceId => {
            voterConduit.emit('removeRace', raceId);
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
            const progressToastId = createProgressToast({
                title: 'Voter Upload',
                message: '',
                min: 0,
                max: file.size
            });

            const errorToast = message => createAutoExpireToast({
                    variant: 'error',
                    title: 'Upload Error',
                    message
                });

            post(`/voter/${candidateId}/upload`, file, {
                headers: {
                    'Content-type': file.type
                },
                onUploadProgress(e) {
                    if (e.loaded === e.total) {
                        updateToast(progressToastId, {
                            message: 'Upload complete!',
                            value: e.loaded,
                            max: e.total,
                        });
                        return;
                    }
                    updateToast(progressToastId, {
                        value: e.loaded,
                        max: e.total,
                        messaage: `${formatBytes(e.loaded, 'mb')} mb / ${formatBytes(e.total, 'mb')} mb`
                    })
                }
            })
                .catch(e => {
                    if (e.response.statusCode === 413) {
                        errorToast('That image is too big!');
                    }
                    else {
                        errorToast(e.response.statusText);
                    }
                });
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

voterConduit.on({
    refresh: (races) => {
        voterRaces.set(races);
        voterInitialized.set(true);
    }
})
