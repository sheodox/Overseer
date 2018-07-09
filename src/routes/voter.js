import valid from '../util/validator';
import FlatFile from '../util/flatfile';
import maskRaceSessions from '../util/maskVoterSessions';
const SilverConduit = require('../util/SilverConduit');
const voterBooker = require('../db/voterbooker');

const raceFile = new FlatFile('./racedata.json', []);

function raceExists(name) {
    return raceFile.data.some(r => {
        return r.name.toLowerCase() === name.toLowerCase();
    })
}

function candidateExists(race, name) {
    return race.candidates.some(r => {
        return r.name.toLowerCase() === name.toLowerCase();
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

//trim and remove all unnecessary spaces
function cleanString(str) {
    return String(str).trim().replace(/\s{2,}/g, ' ');
}

export default function(io) {
    const ioConduit = new SilverConduit(io, 'voter');
    function broadcast() {
        ioConduit.filteredBroadcast('refresh', async userId => {
            if (await voterBooker.check(userId, 'view')) {
                return maskRaceSessions(raceFile.data, userId);
            }
        });
    }

    io.on('connection', socket => {
        const socketConduit = new SilverConduit(socket, 'voter');
        let userId;

        socketConduit.on({
            init: () => {
                userId = socket.handshake.session.passport.user.profile.id;
                socketConduit.emit('refresh', maskRaceSessions(raceFile.data, userId));
            },
            newRace: async name => {
                if (await voterBooker.check(userId, 'add_race')) {
                    name = cleanString(name);
                    console.log(`new race ${name}`);
                    if (valid.name(name) && !raceExists(name)) {
                        raceFile.data.push({
                            id: newId(raceFile.data),
                            name: name,
                            candidates: []
                        });
                        raceFile.save();
                        broadcast();
                    }
                }
            },
            newCandidate: async (raceId, name) => {
                if (await voterBooker.check(userId, 'add_candidate')) {
                    name = cleanString(name);
                    console.log(`new candidate ${name} in ${raceId}`);
                    let race = getRace(raceId);
                    if (valid.name(name) && !candidateExists(race, name)) {
                        race.candidates.push({
                            name: name,
                            votedUp: [],
                            votedDown: []
                        });
                        raceFile.save();
                        broadcast();
                    }
                }
            },
            toggleVote: async (raceId, candidateId, direction) => {
                if (await voterBooker.check(userId, 'vote')) {
                    const userId = socket.handshake.session.passport.user.profile.id,
                        candidate = getCandidate(raceId, candidateId),
                        [to, from] = direction === 'up'
                            ? [candidate.votedUp, candidate.votedDown]
                            : [candidate.votedDown, candidate.votedUp];

                    console.log(`voting ${direction} for ${userId} on ${raceId}'s ${candidateId}`);

                    //ensure the vote isn't in the array
                    const toIndex = to.indexOf(userId),
                        fromIndex = from.indexOf(userId);
                    //if they voted for the other direction before remove their vote
                    if (fromIndex !== -1) {
                        from.splice(fromIndex, 1);
                    }

                    // if they vote 'up' but have already voted 'up', take their vote out, treat it as a toggle instead of complicating logic with a third 'clear' direction
                    if (toIndex !== -1) {
                        to.splice(toIndex, 1);
                    }
                    //just vote
                    else {
                        to.push(userId);
                    }

                    raceFile.save();
                    broadcast();
                }
            },
            removeCandidate: async (raceId, candidateId) => {
                if (await voterBooker.check(userId, 'remove_candidate')) {
                    console.log(`remove candidate ${candidateId} from ${raceId}`);
                    const race = getRace(raceId),
                        candidateIndex = race.candidates.findIndex(c => {
                            return c.name === candidateId;
                        });
                    race.candidates.splice(candidateIndex, 1);
                    raceFile.save();
                    broadcast();
                }
            },
            removeRace: async raceId => {
                if (await voterBooker.check(userId, 'remove_race')) {
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
            },
            resetVotes: async raceId => {
                if (await voterBooker.check(userId, 'reset_votes')) {
                    const race = raceFile.data.find(r => {
                        return r.id === raceId;
                    });
                    if (race) {
                        console.log(`clearing votes for ${race.name}`);
                        race.candidates.forEach(candidate => {
                            candidate.votedUp = [];
                            candidate.votedDown = [];
                        });
                        raceFile.save();
                        broadcast();
                    }
                }
            }
        });
    });
}