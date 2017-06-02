'use strict';
const express = require('express'),
    app = express(),
    debug = require('debug')('game-voter:server'),
    server = require('http').createServer(app),
    cookieParser = require('cookie-parser'),
    io = require('socket.io')(server),
    path = require('path'),
    favicon = require('serve-favicon'),
    shortid = require('shortid'),
    logger = require('morgan'),
    ghost = require('./ghost').default,
    echo = require('./routes/game-echo'),
    settings = require('./routes/settings').default,
    voter = require('./routes/voter').default;

app.use(cookieParser());
//basic sesssions
app.use((req, res, next) => {
    if (!req.cookies.sessionId) {
        res.cookie('sessionId', shortid.generate(), {
            maxAge: 999999999
        });
    }
    next();
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));


server.listen(80);
server.on('listening', onListening);

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    console.log('Listening on ' + bind);
}

ghost(io);
echo(io);
voter(io);
settings(io);
app.use(require('./routes/index'));

module.exports = app;
