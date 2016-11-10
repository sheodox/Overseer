import React from 'react';
import SVG from './SVG';
import {connect} from 'react-redux';
import actions from '../actions/act-settings-client';

const Settings = React.createClass({
    render: function() {
        const unSettingsProps = {
            sessionId: this.props.sessionId,
            username: this.props.username,
            propose: this.props.propose,
            usernameValid: this.props.usernameValid
        };

        return (
            <section className="panel">
                <div className="panel-title">
                    <h2>Settings</h2>
                    <SVG id="settings-icon" />
                </div>
                <div className="sub-panel">
                    <UserNameSettings {...unSettingsProps} />
                </div>
            </section>
        )
    }
});

const UserNameSettings = React.createClass({
    getInitialState: function() {
        return {
            dirty: false
        }
    },
    onKeyDown: function(e) {
        this.setState({
            dirty: this.props.username !== e.target.value
        });

        if (e.which === 13) {
            this.props.propose(this.props.sessionId, e.target.value);

            this.setState({
                dirty: false
            });
        }
    },
    componentDidUpdate: function(prevProps) {
        //only reset the value if it's changed in the props
        if (prevProps.username !== this.props.username) {
            this.input.value = this.props.username;
        }
    },
    render: function() {
        let inputClass;
        if (this.state.dirty) {
            inputClass = 'dirty';
        }
        else if (this.props.usernameValid !== null) {
            inputClass = this.props.usernameValid ? 'valid' : 'invalid';
        }
        const inputProps = {
            id: 'settings-username-input',
            onKeyDown: this.onKeyDown,
            defaultValue: this.props.username,
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

function mapStateToProps(state) {
    let settings = state.settings;

    return {
        username: settings.username,
        sessionId: settings.sessionId,
        usernameValid: settings.usernameValid
    }
}

function mapDispatchToProps(dispatch) {
    return {
        propose: (id, name) => {
            actions.propose(id, name);
        }
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Settings);