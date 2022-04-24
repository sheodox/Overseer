import './env.js';
import { app, io, server } from './server.js';
import { NextFunction, Request, Response } from 'express';
import passport from 'passport';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import favicon from 'serve-favicon';
import { prisma } from './db/prisma.js';
import path from 'path';
import expressSession from 'express-session';
import { createClient as createRedisClient } from 'redis';
import { requestId } from './util/request-id.js';
import { appLogger } from './util/logger.js';
import { errorHandler } from './util/error-handler.js';
import connectRedis from 'connect-redis';
import { router as authRouter } from './routes/auth.js';
import { router as notificationRouter } from './routes/notifications.js';
import { router as echoRouter } from './routes/echo.js';
import { router as voterRouter } from './routes/voter.js';
import { router as userRouter } from './routes/user.js';
import { router as adminRouter } from './routes/admin.js';
import { router as imagesRouter } from './routes/images.js';
import { router as indexRouter } from './routes/index.js';
import { initEvents } from './routes/events.js';
import './routes/settings.js';

const port = 4000,
	redisClient = createRedisClient({
		host: 'redis',
	}),
	bodySizeLimit = '15mb';

app.use(requestId);
app.use(
	bodyParser.raw({
		type: 'image/png',
		limit: bodySizeLimit,
	})
);
app.use(
	bodyParser.raw({
		type: 'image/jpeg',
		limit: bodySizeLimit,
	})
);
app.use(bodyParser.json({ limit: bodySizeLimit }));
app.use(bodyParser.urlencoded({ limit: bodySizeLimit, extended: true, parameterLimit: 50000 }));
app.use(favicon('./public/favicon.png'));

app.disable('x-powered-by');
app.use(cookieParser());

app.use('/health', (req, res) => {
	res.send();
});

const RedisStore = connectRedis(expressSession),
	sessionStore = new RedisStore({ client: redisClient }),
	session = expressSession({
		store: sessionStore,
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		name: 'overseer-sid',
		cookie: {
			secure: false,
			expires: new Date(253402300000000),
		},
	});
app.use(session);
io.use((socket, next) => {
	session(socket.request as Request, {} as Response, next as NextFunction);
});
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRouter);
// view engine setup
app.set('views', path.resolve('src/server/views'));
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
app.use(adminRouter);
initEvents(io);
app.use(imagesRouter);
app.use(notificationRouter);
app.use(indexRouter);
app.use('/user', userRouter);

app.use((req, res, next) => next({ status: 404 }));
app.use(errorHandler(false));

process.on('unhandledRejection', (error) => {
	appLogger.error(`Unhandled rejection`, {
		error,
	});
});

process.on('uncaughtException', async (error) => {
	console.error('Unhandled Exception!', error);
	await prisma.$disconnect();

	process.exit(1);
});

import './internal-server.js';
