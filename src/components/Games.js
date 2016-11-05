import React from 'react';
import axios from 'axios';
import {connect} from 'react-redux';
import actions from '../actions/act-echo-client';

var Games = React.createClass({
    render: function() {
        var games = this.props.games.map((game, index) => {
            return <Game {...game} echoServer={this.props.echoServer} key={index} delete={this.props.delete}/>
        });

        return (
            <section className="panel" id="games">
                <h2>Game Echo</h2>
                <div className="sub-panel">
                    <Uploader echoServer={this.props.echoServer} />
                    <table>
                        <thead>
                        <tr>
                            <td>Game</td>
                            <td>Size</td>
                            <td>Uploaded</td>
                            <td>Options</td>
                        </tr>
                        </thead>
                        <tbody>
                            {games}
                        </tbody>
                    </table>
                </div>
            </section>
        );
    }
});

var Uploader = React.createClass({
    getInitialState: function() {
        return {
            loaded: 0,
            total: 100
        };
    },
    upload: function(e) {
        var self = this;
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
            .then(function() {
                self.form.reset();
                self.setState({
                    uploading: false
                });
            });
    },
    uploadProgress: function(e) {
        this.setState({
            loaded: e.loaded,
            total: e.total
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
            <div>
                <form ref={c => this.form = c} onSubmit={this.upload}>
                    <input type="file" accept=".zip" name="zippedGame"/>
                    <input type="submit" value="Upload" />
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

var Game = React.createClass({
    delete: function() {
        this.props.delete(this.props.name);
    },
    render: function() {
        return (
            <tr>
                <td>{this.props.name}</td>
                <td>{formatBytes(this.props.size, 'gb') + ' gb'}</td>
                <td>{formatDate(this.props.modified)}</td>
                <td className="centered">
                    <a className="download" href={this.props.echoServer + '/download/' + this.props.name + '.zip'}>⬇</a>
                    <button onClick={this.delete} className="delete">🞩</button>
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

function mapStateToProps(state) {
    return {
        games: state.echo.games,
        echoServer: state.echo.echoServer
    };
}

function mapDispatchToProps(dispatch) {
    socket.on('games/refresh', (games) => {
        dispatch(actions.refresh(games));
    });

    return {
        delete: actions.delete
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Games);