const Users = require('../users');

module.exports = async (races, userId) => {
    races = JSON.parse(JSON.stringify(races));

    function getUserFromCandidate(candidate) {
        return candidate.user_id;
    }

    for (let race of races) {
        for (let candidate of race.candidates) {
            const originalVotedUp = candidate.votedUp.map(getUserFromCandidate),
                originalVotedDown = candidate.votedDown.map(getUserFromCandidate),
                creator = candidate.creator;

            let voted = false;
            if (originalVotedUp.includes(userId)) {
                voted = 'up'
            }
            else if (originalVotedDown.includes(userId)) {
                voted = 'down'
            }

            let creatorName = '???';
            const matchingUser = await Users.getUser(creator);
            if (matchingUser) {
                creatorName = matchingUser.display_name;
            }

            candidate.creator = creatorName;
            candidate.created = creator === userId;
            candidate.voted = voted;
            candidate.votedUp = await Users.getMasked(originalVotedUp);
            candidate.votedDown = await Users.getMasked(originalVotedDown);
        }
    }
    return races;
}
