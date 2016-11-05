
const actions = {
    refresh: function(gamesData) {
        return {
            type: 'GAMES_REFRESH',
            games: gamesData.games,
            echoServer: gamesData.echoServer
        };
    },
    delete: function(name) {
        socket.emit('games/delete', name);
    }
};

export default actions;