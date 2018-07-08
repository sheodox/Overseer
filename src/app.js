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
    ghost = require('./ghost').default,
    echo = require('./routes/game-echo'),
    settings = require('./routes/settings').default,
    voter = require('./routes/voter').default,
    admin = require('./routes/admin');


app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(bodyParser());
const s = session({
    store: new SessionEmitter(),
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    secure: false
});
app.use(s);
app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', auth);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));

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

ghost(io);
echo(io);
voter(io);
settings(io);
app.use(admin(io));
app.use(require('./routes/index'));

module.exports = app;
