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
            candidate.voted = voted;
            candidate.votedUp = User.maskSessions(candidate.votedUp);
            candidate.votedDown = User.maskSessions(candidate.votedDown);
        })
    });

    return races;
}