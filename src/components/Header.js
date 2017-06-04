import React from 'react';
import {Link} from 'react-router';
import SVG from './SVG';

export default React.createClass({
    getInitialState: function() {
        return {
            //don't want to flash red immediately, pretend it's connected
            socketConnected: true
        }
    },
    componentDidMount: function() {
        socket.on('disconnect', () => {
            this.setState({
                socketConnected: false
            });
        });
        socket.on('connect', () => {
            this.setState({
                socketConnected: true
            });
        });
    },
    render: function() {
        return (
            <header className={this.state.socketConnected ? '' : 'disconnected'}>
                <SVG id="logo" />
                <h1>
                    <Link to="/">Overseer</Link>
                </h1>
            </header>
        );
    }

})