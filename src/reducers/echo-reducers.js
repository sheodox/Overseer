var gamesDefault = {
    fetching: false,
    status: null,
    games: []
};

function echo(state = gamesDefault, action) {
    state = JSON.parse(JSON.stringify(state));

    switch (action.type) {
        case 'REQUEST_GAMES':
            return Object.assign(state, {
                fetching: true
            });
        case 'RECEIVED_GAMES':
            return Object.assign({
                fetching: false,
                games: action.games
            });
        default:
            return state;
    }
}

export default({
    echo
});