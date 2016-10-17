var ReactDOM = require('react-dom'),
    React = require('react'),
    List = require('./List'),
    Games = require('./Games'),
    socket = io();

socket.on('reconnect', () => {location.reload();});
socket.on('states', states => {
    ReactDOM.render(
        <List states={states} socket={socket}/>,
        document.querySelector('#groups')
    );
});

socket.on('games', games => {
    ReactDOM.render(
        <Games games={games} />,
        document.querySelector('#games')
    );
});
