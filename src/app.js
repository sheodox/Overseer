'use strict';

const isProd = process.env.NODE_ENV === 'production',
    express = require('express'),
    passport = require('passport'),
    config = require('./config.json'),
    app = express(),
    port = isProd ? 80 : 3000,
    debug = require('debug')('game-voter:server'),
    server = require('http').createServer(app),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    io = require('socket.io')(server),
    path = require('path'),
    favicon = require('serve-favicon'),
    session = require('express-session')({
        secret: config.sessionSecret,
        resave: true,
        saveUninitialized: true,
        secure: false
    }),
    sharedSession = require('express-socket.io-session'),
    auth = require('./routes/auth'),
    logger = require('morgan'),
    ghost = require('./ghost').default,
    echo = require('./routes/game-echo'),
    settings = require('./routes/settings').default,
    voter = require('./routes/voter').default;

app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(bodyParser());
app.use(session);
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
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + port;
    console.log('Listening on ' + bind);
}

io.use(sharedSession(session));

ghost(io);
echo(io);
voter(io);
settings(io);
app.use(require('./routes/index'));

module.exports = app;
