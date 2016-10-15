var ReactDOM = require('react-dom'),
    React = require('react'),
    list = document.querySelector('#groups'),
    List = require('./List'),
    socket = io();

socket.on('reconnect', () => {location.reload();});
socket.on('states', states => {
    ReactDOM.render(
        <List states={states} socket={socket}/>,
        list
    )
});
