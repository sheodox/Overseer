const React = require('react'),
    SVG = require('./SVG'),
    Conduit = require('../util/conduit'),
    settingsConduit = new Conduit(socket, 'settings');

class Settings extends React.Component {
    render() {
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
}

module.exports = Settings;
