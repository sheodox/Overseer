const router = require('express').Router(),
    passport = require('passport'),
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    config = require('../config.json'),
    gAuth = require(config.googleAuth).web,
    Users = require('../users');

passport.use(new GoogleStrategy({
        clientID: gAuth.client_id,
        clientSecret: gAuth.client_secret,
        callbackURL: gAuth.redirect_uris[0]
    },
    function(accessToken, refreshToken, profile, done) {
        Users.register(profile, done);
    }
));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

router.get('/google', passport.authenticate('google', {scope: ['https://www.googleapis.com/auth/plus.login']}));
router.get('/google/callback',
    passport.authenticate('google', {failureRedirect: '/auth/google'}),
    (req, res) => {
        res.redirect('/');
    }
);
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});
module.exports = router;
