const React = require('react'),
    reactRouter = require('react-router'),
    Link = reactRouter.Link,
    browserHistory = reactRouter.browserHistory,
    SVG = require('./SVG').default,
    formatters = require('../util/formatters'),
    axios = require('axios'),
    Conduit = require('../util/conduit'),
    echoConduit = new Conduit(socket, 'echo');

module.exports = React.createClass({
    getInitialState: function() {
        return {
            echoServer: '',
            fileSelected: false,
            loaded: 0,
            total: 100
        };
    },
    componentWillMount: function() {
        echoConduit.on({
            refresh: data => {
                this.setState({echoServer: data.echoServer});
            }
        });
        echoConduit.emit('init');
    },
    componentWillUnmount: function() {
        echoConduit.destroy();
    },
    upload: function(e) {
        e.preventDefault();

        this.setState({
            uploading: true,
            started: Date.now()
        });

        axios
            .post(this.state.echoServer + '/upload', new FormData(this.form), {
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
                browserHistory.push('/w/game-echo');
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
            megabytesPerSecond = formatters.bytes(bytesPerSecond, 'mb'),
            //calculate time till completion
            percentDone = this.state.loaded / this.state.total,
            //remaining = percent left/percent per second
            secondsTillDone = (1 - percentDone) / (percentDone / elapsedSeconds),
            showMinutes = secondsTillDone > 60,
            remaining = `${Math.floor(showMinutes ? secondsTillDone / 60 : secondsTillDone)}${showMinutes ? 'm' : 's'}`,
            disabled = this.state.uploading;

        return (
            <section className="panel" id="echo-uploader">
                <div className="panel-title">
                    <h2>Game Echo Uploader</h2>
                    <SVG id="echo-icon" />
                </div>
                <div className="sub-panel">
                    <audio src="/beeps.wav" ref={c => this.audio = c} />
                    <form ref={c => this.form = c} onSubmit={this.upload}>
                        <label htmlFor="file">Select a zip:</label>
                        <input onChange={this.onFileSelect} type="file" accept=".zip" name="zippedGame" id="file" disabled={disabled}/>
                        <br />
                        <label htmlFor="details">Game details:</label>
                        <textarea id="details" name="details" placeholder="patch information, included mods, description, etc." disabled={disabled}/>
                        <br />
                        <button type="submit" disabled={!this.state.fileSelected || disabled} className="upload-submit">Upload</button>
                        <Link to="/w/game-echo">
                            <button type="button" disabled={disabled}>Cancel</button>
                        </Link>
                    </form>
                    <div style={{display: this.state.uploading ? '' : 'none'}}>
                        <progress type="progress" ref={c => this.progress = c} {...progressValues} />
                        <span>
                        {formatters.bytes(this.state.loaded, 'gb')} / {formatters.bytes(this.state.total, 'gb')} gb - {megabytesPerSecond} mb/s ({remaining})
                    </span>
                    </div>
                </div>
            </section>
        )
    }
});
