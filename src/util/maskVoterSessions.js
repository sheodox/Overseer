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
                originalVotedDown = candidate.votedDown.slice();
            candidate.voted = voted;
            candidate.votedUp = User.maskSessions(originalVotedUp);
            candidate.votedUpImages = User.getImages(originalVotedUp);
            candidate.votedDown = User.maskSessions(originalVotedDown);
            candidate.votedDownImages = User.getImages(originalVotedDown);
        })
    });

    return races;
}