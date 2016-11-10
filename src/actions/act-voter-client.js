const actions = {
    switchRace: raceId => {
        return {
            type: 'VOTER_SWITCH_RACE',
            raceId
        }
    },
    refresh: data => {
        return {
            type: 'VOTER_REFRESH',
            data
        }
    }
};

export default actions;