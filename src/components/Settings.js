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
                    <strong>there doesn't seem to be anything here</strong>
                </div>
            </section>
        )
    }
});

module.exports = Settings;
