import {AppRequest} from "../types";
import {Router, Response} from 'express';
import {OAuth2Strategy} from 'passport-google-oauth';
import {User} from '@prisma/client';
import passport from "passport";
import {users} from "../db/users";

const router = Router();

passport.use(new OAuth2Strategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.GOOGLE_CALLBACK_URL}/auth/google/callback`,
    },
    async function(accessToken, refreshToken, profile, done) {
        const user = await users.register(profile);
        done(null, user);
    }
));

passport.serializeUser(function(user: User, done) {
    done(null, user);
});

passport.deserializeUser(async (user: User, done) => {
    done(null, user);
});

router.get('/google', (req, res, next) => {
    passport.authenticate('google', {
        scope: ['https://www.googleapis.com/auth/plus.login']
    })(req, res, next);
});
router.get('/google/callback', (req, res, next) => {
    passport.authenticate('google', {
        successRedirect: '/',
        failureRedirect: '/'
    })(req, res, next);
});

router.get('/logout', (req: AppRequest, res: Response) => {
    req.logout();
    res.redirect('/');
});
module.exports = router;
