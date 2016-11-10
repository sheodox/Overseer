import express from 'express';
import store from '../reducers/reducers';
import serialize from 'serialize-javascript';
import maskVoterSessions from '../util/maskVoterSessions';

const router = express.Router();

/* GET home page for / and any client side routing urls */
router.get('/|/w/', function(req, res) {
    const state = JSON.parse(JSON.stringify(store.getState()));
    console.log(state);
    state.voter.races = maskVoterSessions(state.voter.races);
    res.render('index', {
        preloadedState: serialize(state, {isJSON: true})
    });
});

module.exports = router;
