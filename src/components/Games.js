import React from 'react';
import axios from 'axios';
import {connect} from 'react-redux';
import actions from '../actions/echo-actions';

var Games = React.createClass({
    componentDidMount: function() {
        this.props.load();
    },
    render: function() {
        var games = this.props.games.map((game, index) => {
            return <Game {...game} key={index} delete={this.props.delete}/>
        });

        return (
            <section className="panel" id="games">
                <h2>Game Echo</h2>
                <div className="sub-panel">
                    <Uploader storageServer={this.props.storageServer} />
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
        axios.post(this.props.storageServer + '/upload', new FormData(this.form), {
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
        var progressValues = {
            value: this.state.loaded,
            max: this.state.total
        };

        return (
            <div>
                <form ref={c => this.form = c} onSubmit={this.upload}>
                    <input type="file" accept=".zip" name="zippedGame"/>
                    <input type="submit" value="Upload" />
                </form>
                <div style={{display: this.state.uploading ? '' : 'none'}}>
                    <progress type="progress" ref={c => this.progress = c} {...progressValues} />
                    <span>
                        {formatBytes(this.state.loaded)} / {formatBytes(this.state.total)}
                    </span>
                </div>
            </div>
        )
    }
});

var Game = React.createClass({
    delete: function() {
        this.props.delete(this.props.game);
    },
    render: function() {
        return (
            <tr>
                <td>{this.props.game}</td>
                <td>{formatBytes(this.props.size)}</td>
                <td>{formatDate(this.props.modified)}</td>
                <td className="centered">
                    <a className="download" href={this.props.downloadURL} download={this.props.game + '.zip'}>⬇</a>
                    <button onClick={this.delete} className="delete">🞩</button>
                </td>
            </tr>
        )
    }
});

function formatBytes(bytes) {
    return `${(bytes / 1000000000).toFixed(2)} gb`;
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
        storageServer: state.echo.storageServer
    };
}

function mapDispatchToProps(dispatch) {
    return {
        delete: (name) => {
            dispatch(actions.delete(name))
        },
        load: () => {
            dispatch(actions.requestGames())
        }
    }
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Games);