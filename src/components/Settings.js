import React from 'react';
import SVG from './SVG';
const Conduit = require('../util/conduit'),
    settingsConduit = new Conduit(socket, 'settings');

const Settings = React.createClass({
    render: function() {
        return (
            <section className="panel">
                <div className="panel-title">
                    <h2>Settings</h2>
                    <SVG id="settings-icon" />
                </div>
                <div className="sub-panel">
                    <UserNameSettings />
                </div>
            </section>
        )
    }
});

const UserNameSettings = React.createClass({
    getInitialState: function() {
        return {
            dirty: false,
            usernameValid: null,
            username: localStorage.getItem('username') || '',
            sessionId: localStorage.getItem('sessionId') || /sessionId=(\w*)/.exec(document.cookie)[1]
        }
    },
    onKeyUp: function(e) {
        this.setState({
            dirty: this.state.username !== e.target.value
        });

        if (e.which === 13) {
            settingsConduit.emit('propose', this.state.sessionId, e.target.value, username => {
                //if we got a username back it was valid
                if (username) {
                    localStorage.setItem('username', username);
                    localStorage.setItem('sessionId', this.state.sessionId);
                }
                this.setState({
                    username: username,
                    usernameValid: !!username
                });
            });

            this.setState({
                dirty: false
            });
        }
    },
    render: function() {
        let inputClass;
        if (this.state.dirty) {
            inputClass = 'dirty';
        }
        else if (this.state.usernameValid !== null) {
            inputClass = this.state.usernameValid ? 'valid' : 'invalid';
        }
        const inputProps = {
            id: 'settings-username-input',
            onKeyUp: this.onKeyUp,
            defaultValue: this.state.username,
            className: inputClass,
            type: 'text',
            title: 'at least three alphanumeric characters',
            maxLength: 20
        };
        return (
            <div className="control">
                <label htmlFor={inputProps.id}>Username </label>
                <input ref={c => this.input = c} {...inputProps} />
            </div>
        );
    }
});

module.exports = Settings;
