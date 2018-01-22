const React = require('react'),
    reactRouter = require('react-router-dom'),
    Link = reactRouter.Link,
    SVG = require('./SVG').default,
    TagCloud = require('./TagCloud'),
    formatters = require('../util/formatters'),
    axios = require('axios'),
    Conduit = require('../util/conduit'),
    echoConduit = new Conduit(socket, 'echo');

module.exports = React.createClass({
    getInitialState: function() {
        return {
            echoServer: '',
            uploadAllowed: false,
            loaded: 0,
            total: 100,
            tagCloud: []
        };
    },
    componentWillMount: function() {
        echoConduit.on({
            refresh: data => {
                this.setState(data);
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
                    uploadAllowed: false,
                    uploading: false
                });
                this.audio.volume = 0.4;
                this.audio.play();
                setTimeout(() => {
                    this.props.history.push('/w/game-echo');
                }, this.audio.duration * 1000);
            });
    },
    uploadProgress: function(e) {
        this.setState({
            loaded: e.loaded,
            total: e.total
        });
    },
    checkUploadAllowed: function() {
         this.setState({
             uploadAllowed: this.fileSelect.value && this.name.value
         })
    },
    onFileSelect: function(e) {
        //file selections will give a value of C:\fakepath\Game Name.zip, trim the non-name bits
        const selectedGame = e.target.value.replace(/^C\:\\fakepath\\|.zip$/g, ''),
            existingGame = this.state.games.find(g => g.name === selectedGame);
        if (existingGame) {
            this.details.value = existingGame.details;
            this.tags.value = (existingGame.tags || []).join(', ');
            this.name.value = existingGame.name || selectedGame;
        }
        else {
            this.name.value = selectedGame;
        }
        this.checkUploadAllowed();
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
                    <audio src="/beeps.wav" preload="auto" ref={c => this.audio = c} />
                    <form ref={c => this.form = c} onSubmit={this.upload}>
                        <label htmlFor="file">Select a zip:</label>
                        <input ref={c => this.fileSelect = c} onChange={this.onFileSelect} type="file" accept=".zip" name="zippedGame" id="file" disabled={disabled}/>
                        <br />
                        <div className="control">
                            <label htmlFor="name">Game name:</label>
                            <input ref={c => this.name = c} id="name" name="name" />
                        </div>
                        <div className="control">
                            <label htmlFor="tags">Tags:</label>
                            <input ref={c => this.tags = c} id="tags" name="tags" placeholder="tags separated by commas" />
                        </div>
                        <TagCloud tagInput={this.tags} tags={this.state.tagCloud} tagClicked={tag => console.log(tag)}/>
                        <br />
                        <label htmlFor="details">Game details:</label>
                        <textarea ref={c => this.details = c} id="details" name="details" placeholder="patch information, included mods, description, etc." disabled={disabled}/>
                        <br />
                        <button type="submit" disabled={!this.state.uploadAllowed || disabled} className="upload-submit">Upload</button>
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
