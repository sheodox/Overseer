require('dotenv').config();
import express, {NextFunction, Request, Response} from 'express';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import path from 'path';
import expressSession from 'express-session';
import {Server as SocketIOServer} from 'socket.io';
import {createClient as createRedisClient} from 'redis';
import connectRedis from 'connect-redis';

const app = express(),
    port = 4000,
    server = require('http').createServer(app),
    io = new SocketIOServer(server),
    redisClient = createRedisClient({
        host: 'redis'
    }),
    auth = require('./routes/auth'),
    logger = require('morgan'),
    initEchoRouter = require('./routes/echo'),
    settings = require('./routes/settings'),
    voter = require('./routes/voter'),
    admin = require('./routes/admin'),
    images = require('./routes/images'),
    bodySizeLimit = '15mb';

app.use(bodyParser.raw({
    type: 'image/png',
    limit: bodySizeLimit
}));
app.use(bodyParser.raw({
    type: 'image/jpeg',
    limit: bodySizeLimit
}));
app.use(bodyParser.json({limit: bodySizeLimit}));
app.use(bodyParser.urlencoded({limit: bodySizeLimit, extended: true, parameterLimit: 50000}));

app.use(logger('dev'));

app.disable('x-powered-by');
app.use(cookieParser());

const RedisStore = connectRedis(expressSession),
    sessionStore = new RedisStore({client: redisClient}),
    session = expressSession({
        store: sessionStore,
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false,
            expires: new Date(253402300000000)
        }
    });
app.use(session);
io.use((socket, next) => {
    session(socket.request as Request, {} as Response, next as NextFunction);
})
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', auth);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

server.listen(port);
server.on('listening', () => {
    console.log(`
 __        ___  __   __   ___  ___  __  
/  \\ \\  / |__  |__) /__\` |__  |__  |__) 
\\__/  \\/  |___ |  \\ .__/ |___ |___ |  \\ 
                                        
`);
    console.log('Listening on ' + port);
});

initEchoRouter(io);
app.use(voter(io));
settings(io);
app.use(admin(io));
app.use(images);
app.use(require('./routes'));
