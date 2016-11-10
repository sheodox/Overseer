import store from '../reducers/reducers';
import actions from '../actions/act-voter-server';
import valid from '../util/validator';
import FlatFile from '../util/flatfile';
import maskRaceSessions from '../util/maskVoterSessions';

const raceData = new FlatFile('./racedata.json', []);
store.dispatch(actions.refresh(raceData.data));

function raceExists(name) {
    return raceData.data.some(r => {
        return r.name === name;
    })
}

function candidateExists(race, name) {
    return race.candidates.some(r => {
        return r.name === name;
    })
}

function getRace(id) {
    return raceData.data.find(r => {
        return r.id === id;
    })
}


export default function(io) {
    function broadcast() {
        let races = store.getState().voter.races;
        raceData.data = races;
        raceData.save();
        io.emit('voter/refresh', maskRaceSessions(races));
    }

    io.on('connection', socket => {
        socket.on('voter/newRace', name => {
            console.log(`new race ${name}`);
            if (valid.name(name, true) && !raceExists(name)) {
                store.dispatch(actions.newRace(name));
                broadcast();
            }
        });
        socket.on('voter/newCandidate', (raceId, name) => {
            console.log(`new candidate ${name} in ${raceId}`);
            let race = getRace(raceId);
            if (valid.name(name, true) && !candidateExists(race, name)) {
                store.dispatch(actions.newCandidate(raceId, name));
                broadcast();
            }
        });
        socket.on('voter/toggleVote', (raceId, candidateId, sessionId) => {
            console.log(`toggle vote for ${sessionId} on ${raceId}'s ${candidateId}`);
            store.dispatch(actions.toggleVote(raceId, candidateId, sessionId));
            broadcast();
        });
        socket.on('voter/removeCandidate', (raceId, candidateId) => {
            console.log(`remove candidate ${candidateId} from ${raceId}`);
            store.dispatch(actions.removeCandidate(raceId, candidateId));
            broadcast();
        })
    });
}