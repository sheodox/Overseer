var gamesDefault = {
    echoServer: '',
    games: []
};

function findGameIndex(games, name) {
    return games.findIndex(g => {
        return g.name === name;
    })
}

function echo(state = gamesDefault, action) {
    state = JSON.parse(JSON.stringify(state));

    let index;
    switch (action.type) {
        case 'GAMES_REFRESH':
            console.log('games refreshed from echo server');
            return Object.assign(state, {
                games: action.games,
                echoServer: action.echoServer
            });
        case 'GAMES_ADD':
            console.log(`adding: ${action.game.name}`);
            index = findGameIndex(state.games, action.game.name);
            if (index !== -1) {
                state.games[index] = action.game;
            }
            else {
                state.games.push(action.game);
            }
            return state;
        case 'GAMES_REMOVE':
            console.log(`removing: ${action.name}`);
            index = findGameIndex(state.games, action.name);

            if (index !== -1) {
                state.games.splice(index, 1);
            }
            return state;
        default:
            return state;
    }
}

export default({
    echo
});