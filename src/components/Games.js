import React from 'react';
import SVG from './SVG';
const formatters = require('../util/formatters'),
    reactRouter =require('react-router'),
    Link = reactRouter.Link,
    Conduit = require('../util/conduit'),
    echoConduit = new Conduit(socket, 'echo');

//cache the state so we can use this state every time we re-mount to prevent jitter as it does a proper refresh of the list
let cachedState = {echoConnected: false, games: [], echoServer: ''};

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
                        <Link to="/w/game-echo/upload">
                            <button className={this.state.echoConnected ? '' : 'hidden'}>
                                Upload a game
                            </button>
                        </Link>
                        <table>
                            <thead>
                            <tr>
                                <td>Game</td>
                                <td>Size</td>
                                <td>Uploaded</td>
                                <td>Actions</td>
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


const Game = React.createClass({
    render: function() {
        return (
            <tr>
                <td>{this.props.name}</td>
                <td>{formatters.bytes(this.props.size, 'gb') + ' gb'}</td>
                <td>{formatters.date(this.props.modified)}</td>
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
            </tr>
        )
    }
});

module.exports = Games;
