require('dotenv').config();
import {app, io, server} from "./server";
import {NextFunction, Request, Response} from 'express';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import favicon from 'serve-favicon';
import {prisma} from "./db/prisma";
import path from 'path';
import expressSession from 'express-session';
import {createClient as createRedisClient} from 'redis';
import {requestId} from "./util/request-id";
import {appLogger} from "./util/logger";
import {errorHandler} from "./util/error-handler";
import connectRedis from 'connect-redis';
import {router as authRouter} from './routes/auth';
import {router as notificationRouter} from './routes/notifications';
import {router as echoRouter} from './routes/echo';
import {router as voterRouter} from './routes/voter';
import {initEvents} from './routes/events';

const port = 4000,
    redisClient = createRedisClient({
        host: 'redis'
    }),
    logger = require('morgan'),
    settings = require('./routes/settings'),
    userRouter = require('./routes/user'),
    admin = require('./routes/admin'),
    images = require('./routes/images'),
    bodySizeLimit = '15mb';

app.use(requestId);
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
app.use(favicon('./public/assets/favicon.png'));

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

app.use('/auth', authRouter);
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
    appLogger.info('Overseer server started!');
});

app.use(echoRouter);
app.use(voterRouter);
settings(io);
app.use(admin(io));
initEvents(io);
app.use(images);
userRouter(io);
app.use(notificationRouter);
app.use(require('./routes/index'));

app.use((req, res, next) => next({status: 404}))
app.use(errorHandler(false));

process.on('unhandledRejection', (error) => {
    appLogger.error(`Unhandled rejection`, {
        error
    });
});

process.on('uncaughtException', async error => {
    console.error('Unhandled Exception!', error);
    await prisma.$disconnect();

    process.exit(1);
})

import './internal-server'
