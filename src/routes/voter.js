const maskRaceSessions = require('../util/maskVoterSessions'),
    SilverConduit = require('../util/SilverConduit'),
    voterBooker = require('../db/voterbooker'),
    Users = require('../users'),
    voterTracker = require('../util/VoterTracker');

module.exports = function(io) {
    const ioConduit = new SilverConduit(io, 'voter'),
        notificationConduit = new SilverConduit(io, 'notifications');

    async function broadcast() {
        const raceData = await voterTracker.list();
        ioConduit.filteredBroadcast('refresh', async userId => {
            if (await voterBooker.check(userId, 'view')) {
                return await maskRaceSessions(raceData, userId);
            }
        });
    }
    async function notificationBroadcast(notificationData) {
        notificationConduit.filteredBroadcast('notification', async user_id => {
            if (await voterBooker.check(user_id, 'view')) {
                return notificationData;
            }
        });
    }

    io.on('connection', socket => {
        const socketConduit = new SilverConduit(socket, 'voter'),
            singleUserNotifications = new SilverConduit(socket, 'notifications');
        let userId, displayName;

        socketConduit.on({
            init: async () => {
                userId = socket.handshake.session.passport.user.user_id;
                displayName = (await Users.getUser(userId)).display_name;
                
                if (await voterBooker.check(userId, 'view')) {
                    const raceData = await voterTracker.list();
                    socketConduit.emit('refresh', await maskRaceSessions(raceData, userId));
                }
            },
            newRace: async name => {
                if (await voterBooker.check(userId, 'add_race')) {
                    const raceData = await voterTracker.addRace(name);
                    broadcast();
                    notificationBroadcast({
                        type: 'link',
                        title: 'Voter - New Race',
                        text: `A new race "${raceData.race_name}" was added to Voter by ${displayName}!`,
                        href: `/w/voter/${raceData.race_id}`
                    });
                }
            },
            newCandidate: async (raceId, name) => {
                if (await voterBooker.check(userId, 'add_candidate')) {
                    //overwrite name with the cleaned name from the tracker
                    const {candidate_name, error} = await voterTracker.addCandidate(raceId, name, userId);
                    //if we got the name back, it means it was added, don't notify anyone if it wasn't
                    if (candidate_name) {
                        broadcast();

                        const {race_name} = (await voterTracker.getRaceById(raceId));
                        notificationBroadcast({
                            type: 'link',
                            title: 'Voter - New Candidate',
                            text: `${displayName} added "${name}" to ${race_name} in Voter!`,
                            href: `/w/voter/${raceId}`
                        });
                    }
                    else if (error) {
                        singleUserNotifications.emit('notification', {
                            type: 'text',
                            title: 'Voter Error',
                            text: error
                        });
                    }
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
