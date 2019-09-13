'use strict';

const isProd = process.env.NODE_ENV === 'production',
    express = require('express'),
    passport = require('passport'),
    config = require('./config.json'),
    app = express(),
    port = 3000,
    debug = require('debug')('game-voter:server'),
    server = require('http').createServer(app),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    io = require('socket.io')(server),
    path = require('path'),
    favicon = require('serve-favicon'),
    session = require('express-session'),
    SessionEmitter = require('./util/sessionstore')(session),
    sharedSession = require('express-socket.io-session'),
    auth = require('./routes/auth'),
    logger = require('morgan'),
    ghost = require('./ghost'),
    echo = require('./routes/game-echo'),
    settings = require('./routes/settings'),
    voter = require('./routes/voter'),
    admin = require('./routes/admin'),
    proxy = require('./routes/proxy');

app.use(logger('dev'));

app.disable('x-powered-by');
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
const s = session({
    store: new SessionEmitter(),
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    secure: false,
    cookie: {
        expires: new Date(253402300000000)
    }
});
app.use(s);
app.use(passport.initialize());
app.use(passport.session());
app.use('/proxy', proxy);
app.use(bodyParser());

app.use('/auth', auth);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');


server.listen(port);
server.on('listening', onListening);

function onListening() {
    console.log(`
 __        ___  __   __   ___  ___  __  
/  \\ \\  / |__  |__) /__\` |__  |__  |__) 
\\__/  \\/  |___ |  \\ .__/ |___ |___ |  \\ 
                                        
`);
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + port;
    console.log('Listening on ' + bind);
}

io.use(sharedSession(s));

app.use(ghost(io));
echo(io);
voter(io);
settings(io);
app.use(admin(io));
app.use(require('./routes/index'));

module.exports = app;
