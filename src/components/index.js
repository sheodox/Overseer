import ReactDOM from 'react-dom';
import React from 'react';
import {Router, Route, hashHistory} from 'react-router';
import {Provider} from 'react-redux';
import Lights from './Lights';
import Games from './Games';
import Switchboard from './Switchboard';
import store from '../reducers/reducers';
window.socket = io();

socket.on('reconnect', () => {location.reload();});

ReactDOM.render(
    <Provider store={store}>
        <Router history={hashHistory}>
            <Route path="/" component={Switchboard} />
            <Route path="/lights" component={Lights} />
            <Route path="/game-echo" component={Games} />
        </Router>
    </Provider>,
    document.querySelector('#react-mount')
);

