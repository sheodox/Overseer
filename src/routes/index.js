import express from 'express';
import voter from "./voter";
const serialize = require('serialize-javascript'),
    voterBooker = require('../db/voterbooker');

const router = express.Router();

/* GET home page for / and any client side routing urls */
router.get('/|/w/', async function(req, res) {
    if (req.user) {
        res.render('index', {
            user: serialize({
                displayName: req.user.profile.displayName,
                photoUrl: req.user.profile.photos.length ? req.user.profile.photos[0].value : ''
            }),
            permissions: serialize({
                voter: await voterBooker.getAllUserPermissions(req.user.profile.id)
            })
        });
    }
    else {
        res.render('index', {
            user: serialize(false),
            permissions: serialize({})
        });
    }
});

module.exports = router;
