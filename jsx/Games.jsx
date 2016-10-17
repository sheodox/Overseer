var React = require('react'),
    axios = require('axios');

var Games = React.createClass({
    render: function() {
        var games = this.props.games.map((game, index) => {
            return <Game {...game} key={index}/>
        });

        return (
            <section className="panel">
                <h2>Games</h2>
                <div className="sub-panel">
                    <Uploader />
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
            uploading: true
        });
        axios.post('/game-echo/upload', new FormData(this.form), {
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
                </div>
            </div>
        )
    }
});

var Game = React.createClass({
    delete: function() {
        axios.get('/game-echo/delete/' + this.props.game);
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
    var d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()} ${d.getHours() % 12}:${d.getMinutes()} ${d.getHours() > 12 ? 'pm' : 'am'}`;
}

module.exports = Games;