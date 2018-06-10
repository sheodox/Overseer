const React = require('react'),
    reactRouter = require('react-router-dom'),
    Link = reactRouter.Link,
    SVG = require('./SVG').default,
    TagCloud = require('./TagCloud'),
    formatters = require('../util/formatters'),
    Conduit = require('../util/conduit'),
    echoConduit = new Conduit(socket, 'echo');

module.exports = React.createClass({
    getInitialState: function () {
        return {
            fileName: this.props.match.params.fileName,
            fieldsUpdated: false,
            oldInfo: {}
        };
    },
    redirectToEcho: function() {
        this.props.history.push('/w/game-echo');
    },
    componentWillMount: function () {
        echoConduit.on({
            refresh: data => {
                const thisGame = data.games.find(game => {
                    return game.fileName === this.state.fileName
                });
                //if the game was deleted go back to the list
                if (!thisGame) {
                    this.redirectToEcho();
                }
                else {
                    //force an update if details have changed but only here and not in render() or they can't type
                    ['details', 'name', 'tags'].forEach(type => {
                        const newVal = thisGame[type],
                            oldVal = this.state.oldInfo[type],
                            fieldVal = this[type].value,
                            formattedVal = Array.isArray(newVal) ? newVal.join(', ') : newVal;
                        //compare to old value and typed value, don't want to overwrite changes if something as trivial as download count has changed
                        //make sure the field has something in it too otherwise it won't fill in a blank field on first render
                        if (oldVal !== formattedVal && oldVal === fieldVal || !fieldVal) {
                            this[type].value = formattedVal;
                        }
                    });

                    this.setState(Object.assign(thisGame, {
                        oldInfo: thisGame,
                        tagCloud: data.tagCloud,
                        echoConnected: data.echoConnected,
                        downloadHref: data.echoServer + '/' + this.state.fileName + '.zip'
                    }));
                }
            }
        });
        echoConduit.emit('init');
    },
    componentWillUnmount: function () {
        echoConduit.destroy();
    },
    checkForChanges: function() {
        const somethingChanged = ['details', 'tags', 'name'].some(type => {
            if (!this[type]) {
                return false;
            }
            return this.state[type] !== this[type].value;
        });
        this.setState({
            fieldsUpdated: somethingChanged
        });
    },
    saveChanges: function() {
        ['details', 'tags', 'name'].forEach(type => {
            echoConduit.emit('update', this.state.fileName, type, this[type].value);
        });
        this.setState({
            fieldsUpdated: false
        });
    },
    delete: function() {
        if(confirm(`Are you sure you want to delete ${this.state.name}?`)) {
            echoConduit.emit('delete', this.state.fileName);
        }
    },
    download: function () {
        echoConduit.emit('downloaded', this.state.fileName);
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
                        <a onClick={this.download} className={"download " + (this.state.echoConnected ? '' : 'disabled')} href={this.state.echoConnected ? this.state.downloadHref : null} title="download">
                            <SVG id="down-icon" />
                        </a>
                        <button title="delete game" disabled={!this.state.echoConnected} className="delete-game" onClick={this.delete}><SVG id="x-icon" /></button>
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
                    <div className="control">
                        <label htmlFor="name">Game Name:</label>
                        <input ref={c => this.name = c} onKeyUp={this.checkForChanges} type="text" id="name"/>
                    </div>
                    <div className="control">
                        <label htmlFor="tags">Tags:</label>
                        <input onKeyUp={this.checkForChanges} ref={c => this.tags = c} type="text" id="tags"/>
                    </div>
                    <TagCloud tagInput={this.tags} tags={this.state.tagCloud} tagClicked={this.checkForChanges}/>
                    <br />
                    <label htmlFor="details">Game details:</label>
                    <textarea ref={c => this.details = c} onKeyUp={this.checkForChanges} id="details" name="details" placeholder="patch information, included mods, description, etc." defaultValue={this.state.details} />
                    <br />
                    <button disabled={!this.state.fieldsUpdated} onClick={this.saveChanges}>Save Changes</button>
                    <button type="button" onClick={this.redirectToEcho}>Cancel</button>
                </div>
            </section>
        )
    }
});
