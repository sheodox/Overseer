import React from 'react';
import {Link} from 'react-router-dom';
import SVG from './SVG';

module.exports = React.createClass({
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
                <Link to="/">
                    <div className="content-container">
                        <div className="logo-container">
                            <SVG id="logo" />
                            <SVG id="logo" />
                        </div>
                        <h1>
                            Overseer
                        </h1>
                    </div>
                </Link>
            </header>
        );
    }

})