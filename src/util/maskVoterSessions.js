import User from '../users';

export default (races, userId) => {
    races = JSON.parse(JSON.stringify(races));

    races.forEach(race => {
        race.candidates.forEach(candidate => {
            candidate.voted = candidate.voters.indexOf(userId) !== -1;
            console.log(`voted: ${candidate.voted}, ${userId}`);
            candidate.voters = User.maskSessions(candidate.voters);
        })
    });

    return races;
}