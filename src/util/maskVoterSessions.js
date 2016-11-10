import User from '../users';

export default races => {
    races = JSON.parse(JSON.stringify(races));

    races.forEach(race => {
        race.candidates.forEach(candidate => {
            candidate.voters = User.maskSessions(candidate.voters);
        })
    });

    return races;
}