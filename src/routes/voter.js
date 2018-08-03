import maskRaceSessions from '../util/maskVoterSessions';
const SilverConduit = require('../util/SilverConduit'),
    voterBooker = require('../db/voterbooker'),
    voterTracker = require('../util/VoterTracker');

export default function(io) {
    const ioConduit = new SilverConduit(io, 'voter');

    async function broadcast() {
        const raceData = await voterTracker.list();
        ioConduit.filteredBroadcast('refresh', async userId => {
            if (await voterBooker.check(userId, 'view')) {
                return await maskRaceSessions(raceData, userId);
            }
        });
    }

    io.on('connection', socket => {
        const socketConduit = new SilverConduit(socket, 'voter');
        let userId;

        socketConduit.on({
            init: async () => {
                userId = socket.handshake.session.passport.user.user_id;
                if (await voterBooker.check(userId, 'view')) {
                    const raceData = await voterTracker.list();
                    socketConduit.emit('refresh', await maskRaceSessions(raceData, userId));
                }
            },
            newRace: async name => {
                if (await voterBooker.check(userId, 'add_race')) {
                    await voterTracker.addRace(name);
                    broadcast();
                }
            },
            newCandidate: async (raceId, name) => {
                if (await voterBooker.check(userId, 'add_candidate')) {
                    await voterTracker.addCandidate(raceId, name, userId);
                    broadcast();
                }
            },
            toggleVote: async (raceId, candidateId, direction) => {
                if (await voterBooker.check(userId, 'vote')) {
                    await voterTracker.vote(raceId, candidateId, userId, direction);
                    broadcast();
                }
            },
            removeCandidate: async (raceId, candidateId) => {
                const creator = await voterTracker.getCandidateCreator(raceId, candidateId);

                //allow users to delete their own candidates
                if (creator === userId || await voterBooker.check(userId, 'remove_candidate')) {
                    await voterTracker.removeCandidate(raceId, candidateId);
                    broadcast();
                }
            },
            removeRace: async raceId => {
                if (await voterBooker.check(userId, 'remove_race')) {
                    await voterTracker.removeRace(raceId);
                    broadcast();
                }
            },
            resetVotes: async raceId => {
                if (await voterBooker.check(userId, 'reset_votes')) {
                    await voterTracker.resetVotes(raceId);
                    broadcast();
                }
            }
        });
    });
}