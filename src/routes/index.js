import express from 'express';
const serialize = require('serialize-javascript');

const router = express.Router();

/* GET home page for / and any client side routing urls */
router.get('/|/w/', function(req, res) {
    if (req.user) {
        res.render('index', {
            user: serialize({
                displayName: req.user.profile.displayName,
                photoUrl: req.user.profile.photos.length ? req.user.profile.photos[0].value : ''
            })
        });
    }
    else {
        res.render('index', {
            user: serialize(false)
        });
    }
});

module.exports = router;
