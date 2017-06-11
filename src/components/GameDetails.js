const React = require('react'),
    reactRouter = require('react-router-dom'),
    Link = reactRouter.Link,
    browserHistory = reactRouter.browserHistory,
    SVG = require('./SVG').default,
    formatters = require('../util/formatters'),
    Conduit = require('../util/conduit'),
    echoConduit = new Conduit(socket, 'echo');

module.exports = React.createClass({
    getInitialState: function () {
        return {
            name: this.props.params.name,
            detailsChanged: false
        };
    },
    redirectToEcho: function() {
        browserHistory.push('/w/game-echo');
    },
    componentWillMount: function () {
        echoConduit.on({
            refresh: data => {
                const thisGame = data.games.find(game => {
                    return game.name === this.state.name
                });
                //if the game was deleted go back to the list
                if (!thisGame) {
                    this.redirectToEcho();
                }
                else {
                    //force an update if details have changed but only here and not in render() or they can't type
                    if (thisGame.details !== this.state.details) {
                        this.details.value = thisGame.details;
                    }
                    this.setState(Object.assign(thisGame, {
                        downloadHref: data.echoServer + '/download/' + this.state.name + '.zip'
                    }));
                }
            }
        });
        echoConduit.emit('init');
    },
    componentWillUnmount: function () {
        echoConduit.destroy();
    },
    updateDetails: function() {
        echoConduit.emit('updateDetails', this.state.name, this.details.value);
        this.setState({
            detailsChanged: false
        });
    },
    detailKeyUp: function() {
        this.setState({
            detailsChanged: this.details.value !== this.state.details
        });
    },
    delete: function() {
        if(confirm(`Are you sure you want to delete ${this.state.name}?`)) {
            echoConduit.emit('delete', this.state.name);
        }
    },
    render: function() {
        return (
            <section className="panel" id="echo-details">
                <div className="panel-title">
                    <h2>{this.state.name}</h2>
                    <SVG id="echo-icon" />
                </div>
                <div className="sub-panel">
                    <div className="action-buttons">
                        <a className="download" href={this.state.downloadHref} title="download">
                            <SVG id="down-icon" />
                        </a>
                        <button title="delete game" className="delete-game" onClick={this.delete}><SVG id="x-icon" /></button>
                    </div>
                    <table>
                        <tbody>
                        <tr>
                            <td>Size</td><td>{formatters.bytes(this.state.size, 'gb')}gb</td>
                        </tr>
                        <tr>
                            <td>Uploaded</td><td>{formatters.date(this.state.modified)}</td>
                        </tr>
                        <tr>
                            <td>Downloads</td><td>{this.state.downloads}</td>
                        </tr>
                        </tbody>
                    </table>
                    <label htmlFor="details">Game details:</label>
                    <textarea ref={c => this.details = c} onKeyUp={this.detailKeyUp} id="details" name="details" placeholder="patch information, included mods, description, etc." defaultValue={this.state.details} />
                    <br />
                    <button disabled={!this.state.detailsChanged} onClick={this.updateDetails}>Update Details</button>
                    <button type="button" onClick={this.redirectToEcho}>Cancel</button>
                </div>
            </section>
        )
    }
});
