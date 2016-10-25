'use strict';
var express = require('express'),
    app = express(),
    debug = require('debug')('game-voter:server'),
    server = require('http').createServer(app),
    io = require('socket.io')(server),
    path = require('path'),
    favicon = require('serve-favicon'),
    logger = require('morgan');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.static(path.join(__dirname, 'public')));


server.listen(3000);
server.on('listening', onListening);

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    console.log('Listening on ' + bind);
}

app.use('/game-echo', require('./routes/game-echo')(io));
require('./ghost')(io);
app.use(require('./routes/index'));


module.exports = app;
