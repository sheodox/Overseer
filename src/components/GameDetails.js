const React = require('react'),
    reactRouter = require('react-router-dom'),
    Link = reactRouter.Link,
    Loading = require('./Loading'),
    If = require('./If'),
    SVG = require('./SVG'),
    TagCloud = require('./TagCloud'),
    UserBubble = require('./UserBubble'),
    formatters = require('../util/formatters'),
    Conduit = require('../util/conduit'),
    echoConduit = new Conduit(socket, 'echo');

class GameDetails extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            file: this.props.match.params.file,
            fieldsUpdated: false,
            oldInfo: {},
            loaded: false
        };
    }
    redirectToEcho = () => {
        this.props.history.push('/w/game-echo');
    };
    componentDidMount() {
        echoConduit.on({
            refresh: data => {
                const thisGame = data.games.find(game => {
                    return game.file === this.state.file
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

                    AppControl.title(thisGame.name + ' - Echo');
                    this.setState(Object.assign(thisGame, {
                        oldInfo: formattedGameInfo,
                        tagCloud: data.tagCloud,
                        echoConnected: data.echoConnected,
                        downloadHref: data.echoServer + '/download/' + this.state.file + '.zip',
                        loaded: true
                    }));

                    this.cloud.captureUsedTags();
                }
            }
        });
        echoConduit.emit('init');
    }
    componentWillUnmount() {
        echoConduit.destroy();
    }
    checkForChanges = () => {
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
    };
    saveChanges = () => {
        const changes = ['details', 'tags', 'name'].map(type => {
            return {field: type, value: this[type].value};
        });
        echoConduit.emit('update', this.state.file, changes);
        this.setState({
            fieldsUpdated: false
        });
    };
    delete = () => {
        if(confirm(`Are you sure you want to delete ${this.state.name}?`)) {
            echoConduit.emit('delete', this.state.file);
        }
    };
    download = () => {
        echoConduit.emit('downloaded', this.state.file);
    };
    render() {
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
                    <SVG id="echo-icon" />
                    <h2>{this.state.name}</h2>
                </div>
                <div className="sub-panel">
                    <Loading renderWhen={!this.state.loaded}/>
                    <If showWhen={this.state.loaded}>
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
                                <td>Downloads</td><td>{this.state.downloads}</td>
                            </tr>
                            <tr>
                                <td>Last Upload</td><td><UserBubble user={this.state.last_uploader} />
                                <span title={formatters.dateTime(this.state.modified)}>{formatters.relativeDate(this.state.modified)}</span>
                                </td>
                            </tr>
                            <tr>
                                <td>Initial Upload</td><td><UserBubble user={this.state.initial_uploader} />
                                <span title={formatters.dateTime(this.state.created)}>{formatters.relativeDate(this.state.created)}</span>
                                </td>
                            </tr>
                            </tbody>
                        </table>

                        <div className={inputClass + ' row'}>
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
                        <div className="row">
                            <button {...saveAttrs}>Save Changes</button>
                            <button type="button" onClick={this.redirectToEcho}>{canEdit ? 'Cancel' : 'Back'}</button>
                        </div>
                    </If>
                </div>
            </section>
        )
    }
}

module.exports = GameDetails;
