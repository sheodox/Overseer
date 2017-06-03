import ReactDOM from 'react-dom';
import React from 'react';
import {Router, Route, browserHistory} from 'react-router';
import {Provider} from 'react-redux';
import App from './App';
import Lights from './Lights';
import Games from './Games';
import Voter from './Voter';
import Settings from './Settings';
import store from '../reducers/reducers';
import appActions from '../actions/act-app-client';
import settingsActions from '../actions/act-settings-client';
import voterActions from '../actions/act-voter-client';

// socket.on('reconnect', () => {location.reload();});

socket.on('disconnect', () => {
    store.dispatch(appActions.socketDisconnected());
});
socket.on('connect', () => {
    store.dispatch(appActions.socketConnected());
});

let availableSessionId = /sessionId=(\w*)/.exec(document.cookie)[1];
store.dispatch(settingsActions.setSessionId(
    localStorage.getItem('sessionId') || availableSessionId
));


let storedUsername = localStorage.getItem('username');
if (storedUsername) {
    let sessionId = store.getState().settings.sessionId;
    settingsActions.propose(sessionId, storedUsername);
}

socket.on('settings/usernameAccepted', username => {
    store.dispatch(settingsActions.usernameAccepted(username));
});
socket.on('settings/usernameInvalid', username => {
    store.dispatch(settingsActions.usernameInvalid(username));
});
socket.on('voter/refresh', races => {
    store.dispatch(voterActions.refresh(races));
});

ReactDOM.render(
    <Provider store={store}>
        <Router history={browserHistory}>
            <Route path="/" component={App}>
                <Route path="w/lights" component={Lights} />
                <Route path="w/game-echo" component={Games} />
                <Route path="w/voter" component={Voter} />
                <Route path="w/settings" component={Settings} />
            </Route>
        </Router>
    </Provider>,
    document.querySelector('#react-mount')
);

