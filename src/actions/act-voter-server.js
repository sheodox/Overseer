const actions = {
    refresh: data => {
        return {
            type: 'VOTER_REFRESH',
            data
        };
    },
    newRace: name => {
        return {
            type: 'VOTER_NEW_RACE',
            name
        };
    },
    newCandidate: (raceId, name) => {
        return {
            type: 'VOTER_NEW_CANDIDATE',
            raceId,
            name
        };
    },
    toggleVote: (raceId, candidateId, sessionId) => {
        return {
            type: 'VOTER_TOGGLE',
            raceId,
            candidateId,
            sessionId
        };
    },
    removeCandidate: (raceId, candidateId) => {
        return {
            type: 'VOTER_REMOVE_CANDIDATE',
            raceId,
            candidateId
        }
    }
};

export default actions;