const Users = require('../users');

export default async (races, userId) => {
    races = JSON.parse(JSON.stringify(races));

    for (let race of races) {
        for (let candidate of race.candidates) {
            let voted = false;
            if (candidate.votedUp.includes(userId)) {
                voted = 'up'
            }
            else if (candidate.votedDown.includes(userId)) {
                voted = 'down'
            }
            const originalVotedUp = candidate.votedUp.slice(),
                originalVotedDown = candidate.votedDown.slice(),
                creator = candidate.creator;

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