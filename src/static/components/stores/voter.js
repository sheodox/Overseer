import {writable, derived} from 'svelte/store';
import {socket} from "../../socket";
import {Conduit} from "../../../shared/conduit";
import {activeRouteParams} from "./routing";
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
        rename: (candidateId, name) => {
            voterConduit.emit('renameCandidate', candidateId, name);
        },
        updateNotes: (candidateId, notes) => {
            voterConduit.emit('updateNotes', candidateId, notes);
        }
    },
}

export function createRankedCandidateStore(raceStore, lockStore) {
    return derived([raceStore, lockStore], ([race, locked]) => {
        return rankCandidates(race);
    })
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
        console.log(`data from voter`, races);
        voterRaces.set(races);
        voterInitialized.set(true);
    }
})
