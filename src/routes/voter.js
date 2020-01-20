const maskRaceSessions = require('../util/maskVoterSessions'),
    SilverConduit = require('../util/SilverConduit'),
    voterBooker = require('../db/voterbooker'),
    Users = require('../users'),
    voterTracker = require('../util/VoterTracker'),
    router = require('express').Router();

module.exports = function(io) {
    const ioConduit = new SilverConduit(io, 'voter'),
        notificationConduit = new SilverConduit(io, 'notifications');

    router.post('/voter/:race_id/:candidate_id/upload', async (req, res) => {
        const contentType = req.get('Content-Type');
        //don't save data of the wrong content type
    	if (!['image/jpeg', 'image/png'].includes(contentType)) {
            res.status(415); //unsupported media type
			res.send(`invalid content type "${contentType}", needs to be a jpeg or png`);
        }
        else if (req.user && await voterBooker.check(req.user.user_id, 'add_image')) {
            await voterTracker.uploadImage(
                req.params.race_id,
                req.params.candidate_id,
                req.body,
                contentType
            );
            res.send(null);
            await broadcast();
        }
    });
    router.get('/voter/image/:image_id', async (req, res) => {
        if (req.user && await voterBooker.check(req.user.user_id, 'view')) {
            const imageData = await voterTracker.getImage(
                req.params.image_id
            );
            if (imageData.image_type) {
                res.header('Content-Type', imageData.image_type);
            }
            res.send(imageData.image);
        }
    });

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

        const singleUserError = msg => {
            singleUserNotifications.emit('notification', {
                type: 'text',
                title: 'Voter Error',
                text: msg,
                error: true
            });
        };

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
                        singleUserError(error);
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
            },
            removeImage: async imageId => {
                if (await voterBooker.check(userId, 'remove_image')) {
                    await voterTracker.removeImage(imageId);
                    broadcast();
                }
            },
            updateCandidateName: async (race_id, candidate_id, candidate_name) => {
                if (await voterBooker.check(userId, 'add_candidate')) {
                    await voterTracker.updateCandidateName(race_id, candidate_id, candidate_name);
                    broadcast();
                }
            },
            updateNotes: async (race_id, candidate_id, notes) => {
                if (await voterBooker.check(userId, 'add_candidate')) {
                    await voterTracker.updateNotes(race_id, candidate_id, notes);
                    broadcast();
                }
            },
            addLink: async (race_id, candidate_id, link_text, link_href) => {
                if (await voterBooker.check(userId, 'add_candidate')) {
                    const {error} = await voterTracker.addLink(race_id, candidate_id, link_text, link_href);
                    if (!error) {
                        broadcast();
                    }
                    else {
                        singleUserNotifications.emit('notification', {
                            type: 'text',
                            title: 'Voter Error',
                            text: "That's an invalid link!",
                            error: true
                        });
                    }
                }
            },
            removeLink: async (race_id, candidate_id, link_href) => {
                if (await voterBooker.check(userId, 'add_candidate')) {
                    await voterTracker.removeLink(race_id, candidate_id, link_href);
                    broadcast();
                }
            }
        });
    });
    return router;
};
