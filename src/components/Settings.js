const React = require('react'),
    SVG = require('./SVG'),
    Conduit = require('../util/conduit'),
    settingsConduit = new Conduit(socket, 'settings'),
    lsCache = require('./lsCache'),
    settings = lsCache('settings');

class Settings extends React.Component {
    constructor(props) {
        super(props);

        this.disableTrancemakerRef = React.createRef();
    }
    save = () => {
        settings.disableTrancemaker = this.disableTrancemakerRef.current.checked;

        // location.reload();
    };
    render() {
        return (
            <section className="panel" id="settings">
                <div className="panel-title">
                    <SVG id="settings-icon" />
                    <h2>Settings</h2>
                </div>
                <div className="sub-panel">
                    <form onSubmit={this.save}>
                        <p>If you're using a low performance device you can disable the background animations.</p>
                        <input type="checkbox" id="disable-trancemaker" ref={this.disableTrancemakerRef} defaultChecked={settings.disableTrancemaker} />
                        <label htmlFor="disable-trancemaker">Disable Background Animations</label>

						<br/>
                        <input type="submit" value="Save and reload" />
                    </form>
                </div>
            </section>
        )
    }
}

module.exports = Settings;
