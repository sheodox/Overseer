import React from 'react';
import SVG from './SVG';
const formatters = require('../util/formatters'),
    reactRouter =require('react-router'),
    Link = reactRouter.Link,
    Conduit = require('../util/conduit'),
    echoConduit = new Conduit(socket, 'echo');

//cache the state so we can use this state every time we re-mount to prevent jitter as it does a proper refresh of the list
let cachedState = {diskUsage: {total: 0, used: 0}, echoConnected: false, games: [], echoServer: ''};

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
    render: function() {
        const games = this.state.games.map((game, index) => {
                return <Game {...game} echoServer={this.state.echoServer} key={index} />
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
                            <div className="one-half">
                                <Link to="/w/game-echo/upload">
                                    <button className={this.state.echoConnected ? '' : 'hidden'}>
                                        Upload a game
                                    </button>
                                </Link>
                            </div>
                        </div>
                        <table>
                            <thead>
                            <tr>
                                <th>Game</th>
                                <th>Size</th>
                                <th>Uploaded</th>
                                <th>Actions</th>
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
        if (this.props.total === 0) {
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
        const size = this.props.inProgress ? '??' : formatters.bytes(this.props.size, 'gb') + ' gb';
        return (
            <tr>
                <td>{this.props.name}</td>
                <td>{size}</td>
                <td>{this.props.inProgress ? 'uploading now...' : formatters.date(this.props.modified)}</td>
                {this.props.inProgress ? (<td><progress /></td>) : (
                    <td className="centered">
                        <a className="download" href={this.props.echoServer + '/download/' + this.props.name + '.zip'} title="download">
                            <SVG id="down-icon" />
                        </a>
                        <Link to={"/w/game-echo/details/" + this.props.name}>
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
