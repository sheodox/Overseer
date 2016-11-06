import ReactDOM from 'react-dom';
import React from 'react';
import {Router, Route, browserHistory} from 'react-router';
import {Provider} from 'react-redux';
import App from './App';
import Lights from './Lights';
import Games from './Games';
import store from '../reducers/reducers';
import appActions from '../actions/act-app-client';

window.socket = io();

// socket.on('reconnect', () => {location.reload();});

socket.on('disconnect', () => {
    store.dispatch(appActions.socketDisconnected());
});
socket.on('connect', () => {
    store.dispatch(appActions.socketConnected());
});

ReactDOM.render(
    <Provider store={store}>
        <Router history={browserHistory}>
            <Route path="/" component={App}>
                <Route path="w/lights" component={Lights} />
                <Route path="w/game-echo" component={Games} />
            </Route>
        </Router>
    </Provider>,
    document.querySelector('#react-mount')
);

