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
                    const formattedGameInfo = {};
                    //force an update if details have changed but only here and not in render() or they can't type
                    ['details', 'name', 'tags'].forEach(type => {
                        const newVal = thisGame[type],
                            oldVal = this.state.oldInfo[type],
                            fieldVal = this[type].value,
                            //tags are stored as an array, stringify for comparisons
                            formattedVal = Array.isArray(newVal) ? newVal.join(', ') : newVal;
                        formattedGameInfo[type] = formattedVal;

                        //compare to old value and typed value, don't want to overwrite changes if something as trivial as download count has changed
                        //make sure the field has something in it too otherwise it won't fill in a blank field on first render
                        if (oldVal !== formattedVal && oldVal === fieldVal || !fieldVal) {
                            this[type].value = formattedVal;
                        }
                    });

                    this.setState(Object.assign(thisGame, {
                        oldInfo: formattedGameInfo,
                        tagCloud: data.tagCloud,
                        echoConnected: data.echoConnected,
                        downloadHref: data.echoServer + '/' + this.state.fileName + '.zip'
                    }));

                    this.cloud.captureUsedTags();
                }
            }
        });
        echoConduit.emit('init');
    },
    componentWillUnmount: function () {
        echoConduit.destroy();
    },
    checkForChanges: function() {
        if (this.cloud) {
            this.cloud.captureUsedTags();
        }
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
        const canEdit = Booker.echo.update,
            inputClass = 'control' + (!canEdit ? ' hidden' : ''),
            readonlyState = {readOnly: !canEdit},
            downloadAttrs = {
                onClick: this.download,
                className: "download " + (this.state.echoConnected && Booker.echo.download ? '' : 'disabled hidden'),
                href: this.state.echoConnected && Booker.echo.download ? this.state.downloadHref : null,
                title: "download"
            },
            deleteAttrs = {
                title: "delete game",
                disabled: !this.state.echoConnected || !Booker.echo.delete,
                className: 'delete-game' + (!Booker.echo.delete ? ' hidden': ''),
                onClick: this.delete
            },
            detailsAttrs = {
                ref: c => this.details = c,
                onKeyUp: this.checkForChanges,
                id: "details",
                name: "details",
                placeholder: "patch information, included mods, description, etc.",
                defaultValue: this.state.details,
                ...readonlyState
            },
            saveAttrs = {
                disabled: !this.state.fieldsUpdated || !canEdit,
                onClick: this.saveChanges,
                className: canEdit ? '' : 'hidden'
            };
        return (
            <section className="panel" id="echo-details">
                <div className="panel-title">
                    <h2>{this.state.name}</h2>
                    <SVG id="echo-icon" />
                </div>
                <div className="sub-panel">
                    <div className="action-buttons">
                        <a {...downloadAttrs}>
                            <SVG id="down-icon" />
                        </a>
                        <button {...deleteAttrs}><SVG id="x-icon" /></button>
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
                    <div className={inputClass}>
                        <label htmlFor="name">Game Name:</label>
                        <input ref={c => this.name = c} onKeyUp={this.checkForChanges} type="text" id="name" {...readonlyState} />
                    </div>
                    <div className={inputClass}>
                        <label htmlFor="tags">Tags:</label>
                        <input onKeyUp={this.checkForChanges} ref={c => this.tags = c} type="text" id="tags" autoComplete="off" {...readonlyState} />
                    </div>
                    <TagCloud ref={c => this.cloud = c} tagInput={this.tags} tags={this.state.tagCloud} tagClicked={this.checkForChanges} {...readonlyState} />
                    <br />
                    <label htmlFor="details">Game details:</label>
                    <textarea {...detailsAttrs} />
                    <br />
                    <button {...saveAttrs}>Save Changes</button>
                    <button type="button" onClick={this.redirectToEcho}>{canEdit ? 'Cancel' : 'Back'}</button>
                </div>
            </section>
        )
    }
});
