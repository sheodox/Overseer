const actions = {
    refreshGames: data => {
        return {
            type: 'GAMES_REFRESH',
            games: data.games,
            echoServer: data.echoServer
        }
    },
    deleteGame: name => {
        //remove game from list, it's been deleted from the echo server
        return {
            type: 'GAMES_REMOVE',
            name
        }
    },
    newGame: gameData => {
        return {
            type: 'GAMES_ADD',
            game: gameData
        }
    }

};

export default actions;