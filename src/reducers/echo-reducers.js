var gamesDefault = {
    fetching: false,
    storageServer: '',
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
            return Object.assign(state, {
                fetching: false,
                games: action.games,
                storageServer: action.storageServer
            });
        default:
            return state;
    }
}

export default({
    echo
});