const React = require('react'),
    reactRouter = require('react-router-dom'),
    Link = reactRouter.Link,
    Redirect = reactRouter.Redirect,
    SVG = require('./SVG'),
    TagCloud = require('./TagCloud'),
    formatters = require('../util/formatters'),
    axios = require('axios'),
    Conduit = require('../util/conduit'),
    echoConduit = new Conduit(socket, 'echo'),
    beep = '/beeps.wav';

class EchoUploader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            echoServer: '',
            uploadAllowed: false,
            loaded: 0,
            total: 100,
            tagCloud: [],
            toast: null,
            file: ''
        };
        //no good way to stop maximizing the file input, after a timeout minimize it
        this.minimizeTimeout = null;
    }
    componentDidMount() {
        AppControl.title('Echo Uploader');
    }
    componentWillMount() {
        echoConduit.on({
            refresh: data => {
                this.setState(data);
            }
        });
        echoConduit.emit('init');
        Banshee.load(beep);
    }
    componentWillUnmount() {
        echoConduit.destroy();
    }
    upload = (e) => {
        e.preventDefault();

        this.setState({
            uploading: true,
            started: Date.now()
        });

        const toast = Toaster.add({
            title: `Uploading ${this.name.value.trim()}`,
            type: 'progress'
        });

        //must be made synchronously or the post will not include the file
        const formData = new FormData(this.form);

        echoConduit.emit('new-game', {
            in_progress: true,
            file: this.state.file,
            name: this.name.value,
            tags: this.tags.value,
            details: this.details.value
        }, () => {
            const startTime = Date.now();
            axios
                .post(this.state.echoServer + '/upload', formData, {
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
            }
        );

    };
    checkUploadAllowed () {
         this.setState({
             uploadAllowed: this.fileSelect.value && this.name.value
         })
    }
    onFileSelect = (e) => {
        //file selections will give a value of C:\fakepath\Game Name.zip, trim the non-name bits
        const fileValue = e.target.value,
            isZip = /\.zip$/.test(fileValue),
            selectedGame = fileValue.replace(/^C\:\\fakepath\\|.zip$/g, ''),
            existingGame = this.state.games.find(g => g.file === selectedGame);
        
        //if they're trying to upload a non-zip, clear it
        if (!isZip) {
            e.target.value = null;
            return;
        }
        
        this.setState({
            file: selectedGame
        });

        if (existingGame) {
            this.details.value = existingGame.details;
            this.tags.value = (existingGame.tags || []).join(', ');
            this.name.value = existingGame.name || selectedGame;
            this.cloud.captureUsedTags();
        }
        else {
            this.name.value = selectedGame;
        }
        this.checkUploadAllowed();
    };
    updateTags = () => {
        if (this.cloud) {
            this.cloud.captureUsedTags();
        }
    };
    dragOver = e => {
        this.maximize();
        this.scheduleMinimize();
        e.preventDefault();
    };
    scheduleMinimize() {
        clearTimeout(this.minimizeTimeout);
        this.minimizeTimeout = setTimeout(() => this.minimize(), 250);
    }
    drop = e => {
        this.minimize();
    };
    maximize() {
        if (!this.state.dragging) {
            this.setState({
                dragging: true
            });
        }
    }
    minimize() {
        this.setState({
            dragging: false
        });
    }
    render() {
        if (!Booker.echo.upload) {
            return <Redirect to="/w/game-echo" />
        }
        const disabled = this.state.uploading;

        return (
            <section className="panel" id="echo-uploader"  onMouseLeave={this.mouseLeave} onDragOver={this.dragOver} onDrop={this.drop}>
                <div className="panel-title">
                    <h2>Game Echo Uploader</h2>
                    <SVG id="echo-icon" />
                </div>
                <div className="sub-panel">
                    <form ref={c => this.form = c} onSubmit={this.upload}>
                        <label id="file-label" htmlFor="file" >Select or drag a file here!<span>{this.state.file ? `(${this.state.file}.zip)` : '(no file selected)'}</span></label>
                        <div className={this.state.dragging ? 'file-overlay' : 'hidden'}>
                            Drop to attach file
                        </div>
                        <input ref={c => this.fileSelect = c} onChange={this.onFileSelect} type="file" accept=".zip" name="zippedGame" id="file" disabled={disabled} className={this.state.dragging ? 'dragging' : ''}/>
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
}

module.exports = EchoUploader;
