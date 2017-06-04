import ReactDOM from 'react-dom';
import React from 'react';
import {Router, Route, browserHistory} from 'react-router';
import App from './App';
import Lights from './Lights';
import Games from './Games';
import Voter from './Voter';
import Settings from './Settings';
const Conduit = require('../util/conduit');

// socket.on('reconnect', () => {location.reload();});


const settingsConduit = new Conduit(socket, 'settings');

const storedUsername = localStorage.getItem('username');
if (storedUsername) {
    const sessionId = localStorage.getItem('sessionId') || /sessionId=(\w*)/.exec(document.cookie)[1];
    settingsConduit.emit('propose', sessionId, storedUsername, function(username) {
        //if we got a username back it was valid
        if (username) {
            localStorage.setItem('username', username);
            localStorage.setItem('sessionId', sessionId);
        }
    });
}

ReactDOM.render(
    <Router history={browserHistory}>
        <Route path="/" component={App}>
            <Route path="w/lights" component={Lights} />
            <Route path="w/game-echo" component={Games} />
            <Route path="w/voter" component={Voter} />
            <Route path="w/settings" component={Settings} />
        </Route>
    </Router>,
    document.querySelector('#react-mount')
);

