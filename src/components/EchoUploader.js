const React = require('react'),
    reactRouter = require('react-router-dom'),
    Link = reactRouter.Link,
    SVG = require('./SVG').default,
    TagCloud = require('./TagCloud'),
    formatters = require('../util/formatters'),
    axios = require('axios'),
    Conduit = require('../util/conduit'),
    echoConduit = new Conduit(socket, 'echo'),
    beep = '/beeps.wav';

module.exports = React.createClass({
    getInitialState: function() {
        return {
            echoServer: '',
            uploadAllowed: false,
            loaded: 0,
            total: 100,
            tagCloud: [],
            toast: null
        };
    },
    componentWillMount: function() {
        echoConduit.on({
            refresh: data => {
                this.setState(data);
            }
        });
        echoConduit.emit('init');
        Banshee.load(beep);
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

        const toast = Toaster.add({
            title: `Uploading ${this.name.value.trim()}`,
            type: 'progress'
        });

        const startTime = Date.now();
        axios
            .post(this.state.echoServer + '/upload', new FormData(this.form), {
                headers: {
                    'content-type': 'multipart/form-data'
                },
                onUploadProgress: (e) => {
                    const elapsedSeconds = (Date.now() - startTime) / 1000,
                        //calculate time till completion
                        percentDone = e.loaded / e.total,
                        bytesPerSecond = e.loaded / elapsedSeconds,
                        //remaining = percent left/percent per second
                        secondsTillDone = (1 - percentDone) / (percentDone / elapsedSeconds),
                        showMinutes = secondsTillDone > 60,
                        megabytesPerSecond = formatters.bytes(bytesPerSecond, 'mb'),
                        remaining = `${Math.floor(showMinutes ? secondsTillDone / 60 : secondsTillDone)}${showMinutes ? 'm' : 's'}`;

                    toast({
                        value: e.loaded,
                        max: e.total,
                        text: `${formatters.bytes(e.loaded, 'gb')} / ${formatters.bytes(e.total, 'gb')} gb - ${megabytesPerSecond} mb/s (${remaining})`
                    });
                }
            })
            .then(() => {
                Banshee.play(beep, 0.4);
                toast({
                    type: 'text',
                    text: 'Upload complete!'
                });
            });

        this.form.reset();
        this.setState({
            uploadAllowed: false,
            uploading: false
        });
        this.props.history.push('/w/game-echo');
    },
    checkUploadAllowed: function() {
         this.setState({
             uploadAllowed: this.fileSelect.value && this.name.value
         })
    },
    onFileSelect: function(e) {
        //file selections will give a value of C:\fakepath\Game Name.zip, trim the non-name bits
        const selectedGame = e.target.value.replace(/^C\:\\fakepath\\|.zip$/g, ''),
            existingGame = this.state.games.find(g => g.fileName === selectedGame);
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
    updateTags: function() {
        if (this.cloud) {
            this.cloud.captureUsedTags();
        }
    },
    render: function() {
        const progressValues = {
                value: this.state.loaded,
                max: this.state.total
            },
            disabled = this.state.uploading;

        return (
            <section className="panel" id="echo-uploader">
                <div className="panel-title">
                    <h2>Game Echo Uploader</h2>
                    <SVG id="echo-icon" />
                </div>
                <div className="sub-panel">
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
                            <input ref={c => this.tags = c} id="tags" name="tags" onKeyUp={this.updateTags} onChange={this.updateTags} placeholder="tags separated by commas" autoComplete="off"/>
                        </div>
                        <TagCloud ref={c => this.cloud = c} tagInput={this.tags} tags={this.state.tagCloud} />
                        <br />
                        <label htmlFor="details">Game details:</label>
                        <textarea ref={c => this.details = c} id="details" name="details" placeholder="patch information, included mods, description, etc." disabled={disabled}/>
                        <br />
                        <button type="submit" disabled={!this.state.uploadAllowed || disabled} className="upload-submit">Upload</button>
                        <Link to="/w/game-echo">
                            <button type="button" disabled={disabled}>Cancel</button>
                        </Link>
                    </form>
                </div>
            </section>
        )
    }
});
