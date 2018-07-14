import User from '../users';

export default (races, userId) => {
    races = JSON.parse(JSON.stringify(races));

    races.forEach(race => {
        race.candidates.forEach(candidate => {
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

            candidate.creator = (creator ? User.getUser(creator).displayName : '???');
            candidate.created = creator === userId;
            candidate.voted = voted;
            candidate.votedUp = User.maskSessions(originalVotedUp);
            candidate.votedDown = User.maskSessions(originalVotedDown);
        })
    });

    return races;
}