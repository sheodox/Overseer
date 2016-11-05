import express from 'express';
import state from '../reducers/reducers';
import serialize from 'serialize-javascript';

const router = express.Router();

/* GET home page for / and any client side routing urls */
router.get('/|/w/', function(req, res) {
    console.log(state.getState());
    res.render('index', {
        preloadedState: serialize(state.getState(), {isJSON: true})
    });
});

module.exports = router;
