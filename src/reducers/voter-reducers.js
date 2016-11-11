const defaultState = {
    activeRace: null,
    races: []
};

function newId(races) {
    //highest existing id + 1
    return String(1 + races.reduce((a, b) => {
        return a.id > b.id ? a.id : b.id;
    }, -1));
}

function getRace(races, id) {
    return races.find(r => {
        return r.id === id;
    });
}

function getCandidate(races, raceId, candidateName) {
    const race = getRace(races, raceId);

    if(race) {
        return race.candidates.find(c => {
            return c.name === candidateName;
        });
    }
}


const voter = function(state = defaultState,  action) {
    state = JSON.parse(JSON.stringify(state));

    let race;
    switch(action.type) {
        case 'VOTER_REFRESH':
            let activeRace = state.activeRace === null ? (action.data.length ? action.data[0].id : null) : state.activeRace;
            return Object.assign(state, {
                races: action.data,
                activeRace
            });
        case 'VOTER_SWITCH_RACE':
            state.activeRace = action.raceId;
            return state;
        case 'VOTER_NEW_RACE':
            state.races.push({
                id: newId(state.races),
                name: String(action.name).trim(),
                candidates: []
            });
            return state;
        case 'VOTER_REMOVE_RACE':
            const raceIndex = state.races.findIndex(r => {
                return r.id === action.raceId;
            });

            if (raceIndex !== -1) {
                state.races.splice(raceIndex, 1);
            }
            return state;
        case 'VOTER_NEW_CANDIDATE':
            race = getRace(state.races, action.raceId);
            race.candidates.push({
                name: String(action.name).trim(),
                voters: []
            });
            return state;
        case 'VOTER_TOGGLE':
            const candidate = getCandidate(state.races, action.raceId, action.candidateId),
                voterIndex = candidate.voters.indexOf(action.sessionId),
                voted = voterIndex !== -1;

            if (voted) {
                //unvote
                candidate.voters.splice(voterIndex, 1);
            }
            else {
                //vote
                candidate.voters.push(action.sessionId);
            }

            return state;
        case 'VOTER_REMOVE_CANDIDATE':
            race = getRace(state.races, action.raceId);
            const candidateIndex = race.candidates.findIndex(c => {
                return c.name === action.candidateId;
            });
            race.candidates.splice(candidateIndex, 1);
            return state;
        default:
            return state;
    }
};

export default {
    voter
};