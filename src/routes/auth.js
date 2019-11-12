const router = require('express').Router(),
    passport = require('passport'),
    GoogleStrategy = require('passport-google-oauth20').Strategy,
    config = require('../config.json'),
    gAuth = require(config.googleAuth).web,
    {isValidProxy} = require('./proxy'),
    Users = require('../users');

function getCallbackUrl(req) {
    return gAuth.redirect_uris.find(uri => {
        return uri.includes(req.hostname);
    });
}

passport.use(new GoogleStrategy({
        clientID: gAuth.client_id,
        clientSecret: gAuth.client_secret
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

router.get('/google', (req, res, next) => {
    passport.authenticate('google', {
        callbackURL: getCallbackUrl(req),
        scope: ['https://www.googleapis.com/auth/plus.login']
    })(req, res, next);
});
router.get('/google/callback', (req, res, next) => {
    const redirectProxy = req.cookies['proxy-login-redirect'],
        proxyUrl = isValidProxy(redirectProxy) && `/proxy/${redirectProxy}/`;

    passport.authenticate('google', {
        callbackURL: getCallbackUrl(req),
        successRedirect: proxyUrl || '/',
        failureRedirect: '/auth/google'
    })(req, res, next);
});
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});
module.exports = router;
