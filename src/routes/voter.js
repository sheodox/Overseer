import valid from '../util/validator';
import FlatFile from '../util/flatfile';
import maskRaceSessions from '../util/maskVoterSessions';
const Conduit = require('../util/conduit');

const raceFile = new FlatFile('./racedata.json', []);

function raceExists(name) {
    return raceFile.data.some(r => {
        return r.name === name;
    })
}

function candidateExists(race, name) {
    return race.candidates.some(r => {
        return r.name === name;
    })
}

function getRace(id) {
    return raceFile.data.find(r => {
        return r.id === id;
    })
}

function newId(races) {
    //highest existing id + 1
    return String(1 + races.reduce((a, b) => {
            return parseInt(a.id > b.id ? a.id : b.id, 10);
        }, -1));
}

function getCandidate(raceId, candidateName) {
    const race = getRace(raceId);

    if(race) {
        return race.candidates.find(c => {
            return c.name === candidateName;
        });
    }
}

export default function(io) {
    const ioConduit = new Conduit(io, 'voter');
    function broadcast() {
        for (let socketId in io.sockets.sockets) {
            const socket = io.sockets.sockets[socketId],
                userId = socket.handshake.session.passport.user.profile.id;
            socket.emit('voter:refresh', maskRaceSessions(raceFile.data, userId));
        }
    }

    io.on('connection', socket => {
        const socketConduit = new Conduit(socket, 'voter');
        socketConduit.on({
            init: () => {
                socketConduit.emit('refresh', maskRaceSessions(raceFile.data));
                broadcast();
            },
            newRace: name => {
                console.log(`new race ${name}`);
                if (valid.name(name, true) && !raceExists(name)) {
                    raceFile.data.push({
                        id: newId(raceFile.data),
                        name: String(name).trim(),
                        candidates: []
                    });
                    raceFile.save();
                    broadcast();
                }
            },
            newCandidate: (raceId, name) => {
                console.log(`new candidate ${name} in ${raceId}`);
                let race = getRace(raceId);
                if (valid.name(name, true) && !candidateExists(race, name)) {
                    race.candidates.push({
                        name: String(name).trim(),
                        voters: []
                    });
                    raceFile.save();
                    broadcast();
                }
            },
            toggleVote: (raceId, candidateId) => {
                const userId = socket.handshake.session.passport.user.profile.id,
                    candidate = getCandidate(raceId, candidateId),
                    voterIndex = candidate.voters.indexOf(userId),
                    voted = voterIndex !== -1;
                console.log(`toggle vote for ${userId} on ${raceId}'s ${candidateId}`);

                if (voted) {
                    //unvote
                    candidate.voters.splice(voterIndex, 1);
                }
                else {
                    //vote
                    candidate.voters.push(userId);
                }
                raceFile.save();
                broadcast();
            },
            removeCandidate: (raceId, candidateId) => {
                console.log(`remove candidate ${candidateId} from ${raceId}`);
                const race = getRace(raceId),
                    candidateIndex = race.candidates.findIndex(c => {
                        return c.name === candidateId;
                    });
                race.candidates.splice(candidateIndex, 1);
                raceFile.save();
                broadcast();
            },
            removeRace: raceId => {
                console.log(`remove race ${raceId}`);
                const raceIndex = raceFile.data.findIndex(r => {
                    return r.id === raceId;
                });

                if (raceIndex !== -1) {
                    raceFile.data.splice(raceIndex, 1);
                }
                raceFile.save();
                broadcast();
            }
        });
    });
}