import React from 'react';
import SVG from './SVG';
const formatters = require('../util/formatters'),
    reactRouter =require('react-router-dom'),
    Link = reactRouter.Link,
    Conduit = require('../util/conduit'),
    echoConduit = new Conduit(socket, 'echo');

//cache the state so we can use this state every time we re-mount to prevent jitter as it does a proper refresh of the list
let cachedState = {filteredGames: null, diskUsage: {total: 0, used: 0}, echoConnected: false, games: [], echoServer: ''};

const Games = React.createClass({
    getInitialState: function() {
        return cachedState;
    },
    componentWillMount: function() {
        echoConduit.on({
            refresh: data => {
                cachedState = data;
                this.setState(data);
            }
        });
        echoConduit.emit('init');
    },
    componentWillUnmount: function() {
        echoConduit.destroy();
    },
    search: function() {
        let filteredGames = null;
        //if the search field is empty stop searching
        if (this.searchField.value.trim()) {
            const terms = formatters.tags(this.searchField.value),
                relevancy = this.state.games.map(game => {
                    //add the game name to the tags and format that array as tags so everything is normalized
                    let searchable = [].concat(game.tags);
                    searchable.push(game.name);
                    searchable = formatters.tags(searchable);

                    let matches = searchable.filter(tag => {
                        return !!terms.find(term => {
                            return tag.indexOf(term) >= 0;
                        });
                    }).length;
                    return {game, matches};
                });
            filteredGames = relevancy
                .filter(hit => {
                    return hit.matches > 0;
                })
                .sort((a, b) => b.matches - a.matches)
                .map(hit => {
                    return hit.game;
                })
        }
        this.setState({
            filteredGames
        })
    },
    render: function() {
        const games = (this.state.filteredGames || this.state.games).map((game, index) => {
                return <Game {...game} echoConnected={this.state.echoConnected} echoServer={this.state.echoServer} key={index} />
            }),
            connection = this.state.echoConnected ? 'online' : 'offline';

        return (
            <section className="panel" id="games">
                <div className="panel-title">
                    <h2>Game Echo</h2>
                    <div className={"pulse " + connection} title={"echo server is " + connection}> </div>
                    <SVG id="echo-icon" />
                </div>
                <div className="sub-panel">
                    <div>
                        <div className="columns">
                            <div className="one-half">
                                <DiskUsage {...this.state.diskUsage} />
                            </div>
                            <div className="one-half to-upload">
                                <Link to="/w/game-echo/upload">
                                    <button className={this.state.echoConnected ? '' : 'hidden'}>
                                        Upload a game
                                    </button>
                                </Link>
                            </div>
                        </div>
                        <br/><br/>
                        <div className="g-search control">
                            <label htmlFor="g-search">Search:</label>
                            <input onKeyUp={this.search} ref={c => this.searchField = c} type="text" id="g-search"/>
                        </div>
                        <table>
                            <thead>
                            <tr>
                                <th className="g-name">Game</th>
                                <th className="g-size">Size</th>
                                <th className="g-date">Uploaded</th>
                                <th className="g-actions">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {games}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>
        );
    }
});

const DiskUsage = React.createClass({
    render: function() {
        if (!this.props.total) {
            return <div />
        }
        return (
            <div>
                <span>Used Disk: {formatters.bytes(this.props.used, 'gb')} / {formatters.bytes(this.props.total, 'gb')} gb</span>
                <br />
                <progress id="disk-usage-bar" type="progress" max={this.props.total} value={this.props.used} title={formatters.bytes(this.props.free, 'gb') + ' gb free'} />
            </div>
        );
    }
});

const Game = React.createClass({
    render: function() {
        const size = this.props.inProgress ? '??' : formatters.bytes(this.props.size, 'gb') + ' gb',
            tags = (this.props.tags && this.props.tags.length) ? this.props.tags.join(', ') : 'none!';
        return (
            <tr>
                <td className="g-name" title={"Tags: " + tags}>{this.props.name}</td>
                <td className="g-size">{size}</td>
                <td className="g-date">{this.props.inProgress ? 'uploading now...' : formatters.date(this.props.modified)}</td>
                {this.props.inProgress ? (<td><progress /></td>) : (
                    <td className="centered g-actions">
                        <a className={"download " + (this.props.echoConnected ? '' : 'disabled')} href={this.props.echoConnected ? this.props.echoServer + '/download/' + this.props.fileName + '.zip' : null} title="download">
                            <SVG id="down-icon" />
                        </a>
                        <Link to={"/w/game-echo/details/" + this.props.fileName}>
                            <button className="details" title="details">
                                <SVG id="details-icon" />
                            </button>
                        </Link>
                    </td>
                )}
            </tr>
        )
    }
});

module.exports = Games;
