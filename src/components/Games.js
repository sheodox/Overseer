import React from 'react';
import SVG from './SVG';
const formatters = require('../util/formatters'),
    reactRouter =require('react-router-dom'),
    TagCloud = require('./TagCloud'),
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
    clearSearch() {
        this.searchField.value = '';
        this.search();
    },
    search: function() {
        this.cloud.captureUsedTags();
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
                    game.relevancy = matches / terms.length;
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
        else {
            const games = this.state.games.map(g => {
                delete g.relevancy;
                return g;
            });
            this.setState({games});
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
                            <button title="reset search" onClick={this.clearSearch}><SVG id="x-icon" /></button>
                        </div>
                        <TagCloud ref={c => this.cloud = c} tagInput={this.searchField} tagClicked={this.search} tags={this.state.tagCloud}/>
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
    download: function () {
        if (Booker.echo.download) {
            echoConduit.emit('downloaded', this.props.fileName);
        }
    },
    render: function() {
        const size = this.props.inProgress ? '??' : formatters.bytes(this.props.size, 'gb') + ' gb',
            tags = (this.props.tags && this.props.tags.length) ? this.props.tags.join(', ') : 'none!',
            relevancyPercent = (this.props.relevancy * 100).toFixed(0),
            relevantColorRGBBase = [0, 188, 212],
            bg = relevantColorRGBBase.map(c => c * this.props.relevancy),
            detailsHref = `/w/game-echo/details/${this.props.fileName}`;
        return (
            <tr>
                <td className="g-name" title={"Tags: " + tags}>
                    {this.props.relevancy
                        ? <span title={`${relevancyPercent}% relevant`} className="relevancy-indicator" style={{background: `rgb(${bg.join(',')})`}}> </span>
                        : null
                    }
                    <Link to={detailsHref}>{this.props.name}</Link>
                </td>
                <td className="g-size">{size}</td>
                <td className="g-date">{this.props.inProgress ? 'uploading now...' : formatters.date(this.props.modified)}</td>
                {this.props.inProgress ? (<td><progress /></td>) : (
                    <td className="centered g-actions">
                        <a onClick={this.download} className={"download " + (this.props.echoConnected && Booker.echo.download ? '' : 'disabled')} href={this.props.echoConnected && Booker.echo.download ? this.props.echoServer + '/' + this.props.fileName + '.zip' : null} title="download">
                            <SVG id="down-icon" />
                        </a>
                    </td>
                )}
            </tr>
        )
    }
});

module.exports = Games;
