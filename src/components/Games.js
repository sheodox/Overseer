import React from 'react';
import axios from 'axios';
import SVG from './SVG';
const Conduit = require('../util/conduit'),
    echoConduit = new Conduit(socket, 'echo');

//cache the state so we can use this state every time we re-mount to prevent jitter as it does a proper refresh of the list
let cachedState = {echoConnected: false, games: [], echoServer: ''};

const Games = React.createClass({
    getInitialState: function() {
        return Object.assign({
            isUploading: false
        }, cachedState);
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
    uploadStart: function() {
        this.setState({
            isUploading: true
        });
    },
    uploadFinish: function() {
        this.setState({
            isUploading: false
        });
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
                    <div className={this.state.isUploading ? '' : 'hidden'}>
                        <Uploader uploadFinish={this.uploadFinish} echoServer={this.state.echoServer} />
                    </div>
                    <div className={this.state.isUploading ? 'hidden' : ''}>
                        <button className={this.state.echoConnected ? '' : 'hidden'} onClick={this.uploadStart}>Upload a game</button>
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

const Uploader = React.createClass({
    getInitialState: function() {
        return {
            fileSelected: false,
            loaded: 0,
            total: 100
        };
    },
    upload: function(e) {
        e.preventDefault();

        this.setState({
            uploading: true,
            started: Date.now()
        });

        axios
            .post(this.props.echoServer + '/upload', new FormData(this.form), {
                headers: {
                    'content-type': 'multipart/form-data'
                },
                onUploadProgress: this.uploadProgress
            })
            .then(() => {
                this.form.reset();
                this.setState({
                    fileSelected: false,
                    uploading: false
                });
                this.audio.volume = 0.4;
                this.audio.play();
                this.props.uploadFinish();
            });
    },
    uploadProgress: function(e) {
        this.setState({
            loaded: e.loaded,
            total: e.total
        });
    },
    onFileSelect: function(e) {
        this.setState({
            fileSelected: !!e.target.value
        });
    },
    render: function() {
        const progressValues = {
                value: this.state.loaded,
                max: this.state.total
            },
            elapsedSeconds = (Date.now() - this.state.started) / 1000,
            bytesPerSecond = this.state.loaded / elapsedSeconds,
            megabytesPerSecond = formatBytes(bytesPerSecond, 'mb'),
            //calculate time till completion
            percentDone = this.state.loaded / this.state.total,
            //remaining = percent left/percent per second
            secondsTillDone = (1 - percentDone) / (percentDone / elapsedSeconds),
            showMinutes = secondsTillDone > 60,
            remaining = `${Math.floor(showMinutes ? secondsTillDone / 60 : secondsTillDone)}${showMinutes ? 'm' : 's'}`;

        return (
            <div id="echo-uploader">
                <audio src="/beeps.wav" ref={c => this.audio = c} />
                <form ref={c => this.form = c} onSubmit={this.upload}>
                    <label htmlFor="file">Select a zip:</label>
                    <input onChange={this.onFileSelect} type="file" accept=".zip" name="zippedGame" id="file"/>
                    <br />
                    <label htmlFor="details">Game details:</label>
                    <textarea id="details" name="details" placeholder="patch information, included mods, description, etc." />
                    <br />
                    <button type="submit" disabled={!this.state.fileSelected} className="upload-submit">Upload</button>
                    <button type="button" onClick={this.props.uploadFinish}>Cancel</button>
                </form>
                <div style={{display: this.state.uploading ? '' : 'none'}}>
                    <progress type="progress" ref={c => this.progress = c} {...progressValues} />
                    <span>
                        {formatBytes(this.state.loaded, 'gb')} / {formatBytes(this.state.total, 'gb')} gb - {megabytesPerSecond} mb/s ({remaining})
                    </span>
                </div>
            </div>
        )
    }
});

const Game = React.createClass({
    delete: function() {
        echoConduit.emit('delete', this.props.name);
    },
    render: function() {
        return (
            <tr>
                <td>{this.props.name}</td>
                <td>{formatBytes(this.props.size, 'gb') + ' gb'}</td>
                <td>{formatDate(this.props.modified)}</td>
                <td className="centered">
                    <a className="download" href={this.props.echoServer + '/download/' + this.props.name + '.zip'} title="download">
                        <SVG id="down-icon" />
                    </a>
                    <button onClick={this.delete} className="delete" title="delete">
                        <SVG id="x-icon" />
                    </button>
                </td>
            </tr>
        )
    }
});

function formatBytes(bytes, unit) {
    let units = {
        gb: 1000000000,
        mb: 1000000
    };
    return (bytes / units[unit]).toFixed(2);
}

function formatDate(dateStr) {
    let d = new Date(dateStr),
        day = `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()} `,
        minutes =  d.getMinutes(),
        time;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    time = `${d.getHours() % 12}:${minutes} ${d.getHours() > 12 ? 'pm' : 'am'}`;
    return `${day} - ${time}`;
}
module.exports = Games;
