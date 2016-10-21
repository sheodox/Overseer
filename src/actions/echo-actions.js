import axios from 'axios';

const actions = {
    requestGames: function() {
        return function(dispatch) {
            dispatch({type: 'REQUEST_GAMES'});

            axios.get('/game-echo/list')
                .then(function(response) {
                    dispatch({
                        type: 'RECEIVED_GAMES',
                        games: response.data
                    })
                })
                .catch(function(err) {
                    dispatch({
                        type: 'FAILED_GAMES'
                    })
                })
        }
    },
    delete: function(name) {
        return function(dispatch) {
            axios.get(`/game-echo/delete/${name}`)
                .then(function() {
                    dispatch(actions.requestGames());
                })
                .catch(function() {
                    //todo
                });
        }
    }
};

module.exports = actions;