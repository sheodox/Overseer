const React = require('react'),
    SVG = require('./SVG'),
    Loading = require('./Loading'),
    If = require('./If'),
    {Redirect} = require('react-router-dom'),
    Conduit = require('../util/conduit'),
    UserBubble = require('./UserBubble'),
    voterConduit = new Conduit(socket, 'voter'),
    voteWeights = {
        up: 1,
        down: 1.1
    };

let cachedState = {
    activeRace: null,
    races: [],
    loaded: false
};
class Voter extends React.Component {
    constructor(props) {
        super(props);
        this.state = cachedState;
    }
    static getRaceRoute(id) {
        return `/w/voter/${id}`;
    }
    componentWillMount() {
        const getActiveRaceId = () => {
            if (this.props.match.params.race) {
                return parseInt(this.props.match.params.race, 10);
            }
            else if (cachedState.activeRace) {
                return cachedState.activeRace.race_id;
            }
        };
        voterConduit.on({
            refresh: races => {
                cachedState.races = races;
                if (races.length) {
                    const updatedRace = races.find(r => {
                        return r.race_id === getActiveRaceId();
                    });
                    cachedState.activeRace = updatedRace || races[0];
                }
                else {
                    //blank out the candidate list if all races are gone
                    cachedState.activeRace = null;
                }
                cachedState.loaded = true;
                this.setState(cachedState);
                //redirect to this race in the url
                const raceRoute = Voter.getRaceRoute(
                    cachedState.activeRace ? cachedState.activeRace.race_id : ''
                );
                if (location.pathname !== raceRoute) {
                    this.props.history.push(raceRoute);
                }
            }
        });
        voterConduit.emit('init');
        AppControl.title('Voter');
    }
    componentDidUpdate(prevProps) {
        //could happen if they click a notification to a different race, don't want to cause a loop though
        if (prevProps.match.params.race !== this.props.match.params.race) {
            this.switchRace(parseInt(this.props.match.params.race, 10));
        }
    }
    componentWillUnmount() {
        voterConduit.destroy();
    }
    switchRace = (id) => {
        //NaN can happen if all races have been deleted
        if (isNaN(id)) {
            return;
        }
        const race = this.state.races.find(race => {
            return race.race_id === id;
        });
        cachedState.activeRace = race;
        this.setState({
            activeRace: race
        });
        this.props.history.push(Voter.getRaceRoute(id));
    };
    render() {
        if (!Booker.voter.view) {
            return <Redirect to="/" />;
        }

        return (
            <section className="panel voter-panel">
                <div className="panel-title">
                    <h2>Voter</h2>
                    <SVG id="voter-icon" />
                </div>
                <div className="sub-panel voter">
                    <Loading renderWhen={!this.state.loaded}/>
                    <If renderWhen={this.state.loaded}>
                        <RaceList {...this.state} switchRace={this.switchRace} />
                        {this.state.activeRace ?
                            <CandidateList {...this.state.activeRace} />
                            : null}
                    </If>
                </div>
            </section>
        );
    }
}

class RaceList extends React.Component {
    componentDidMount() {
        this.updateRaceSelection();
    }
    componentDidUpdate() {
        this.updateRaceSelection();
    }
    updateRaceSelection() {
        if (this.props.activeRace) {
            this.select.value = this.props.activeRace.race_id;
        }
    }
    newRaceKeyDown = (e) => {
        if (e.which === 13) {
            voterConduit.emit('newRace', e.target.value);
            e.target.value = '';
        }
    };
    switchRace = () => {
        this.props.switchRace(parseInt(this.select.value, 10));
    };
    removeRace = () => {
        if (confirm(`Really remove ${this.props.activeRace.race_name}?`)) {
            voterConduit.emit('removeRace', this.props.activeRace.race_id);
        }
    };
    render() {
        const races = this.props.races.map((race, index) => {
                return <option value={race.race_id} key={index}>{race.race_name}</option>
            }),
            raceSwitcherId = 'voter-race-switcher',
            raceInputId = 'voter-new-race';

        let addCandidate;
        if (Booker.voter.add_race) {
            addCandidate = <div className="control">
                <label htmlFor={raceInputId}>New race</label>
                <input id={raceInputId} onKeyDown={this.newRaceKeyDown} type="text" maxLength="20"/>
            </div>
        }

        return (
            <div className="race-list">
                {addCandidate}
                <div className="control">
                    <label htmlFor={raceSwitcherId}>View</label>
                    <select ref={c => this.select = c} id={raceSwitcherId} onChange={this.switchRace}>
                        {races}
                    </select>
                    <button disabled={!Booker.voter.remove_race} title="remove race" className="race-remove" onClick={this.removeRace}>
                        <SVG id="x-icon" />
                    </button>
                </div>
            </div>
        );
    }
}

class CandidateList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            candidates: this.getSortedCandidates(this.props),
            canSort: true,
            sortQueued: false,
            detailedView: false
        };

    }
    getSortedCandidates(props, asDetailed) {
        //when in detailed row, sort by the candidate id, otherwise sort by vote ranking.
        //a user is more likely to be actively spending time looking through a detailed list,
        //so re-sorting things would be confusing.
        if (asDetailed || (this.state && this.state.detailedView)) {
            return props.candidates.sort((a, b) => {
                return a.candidate_id - b.candidate_id;
            })
        }

        function weightedVotes(up, down) {
            up = up.length;
            down = down.length;
            return (up * voteWeights.up) - (down * voteWeights.down);
        }
        return props.candidates.sort((a, b) => {
            return weightedVotes(b.votedUp, b.votedDown) - weightedVotes(a.votedUp, a.votedDown);
        })
    }
    componentWillReceiveProps(nextProps) {
        //allow immediate sorting and resetting candidates if the they're not trying to vote or if the active race changes
        if (this.state.canSort || this.props.name !== nextProps.name) {
            this.sortAndSetState(nextProps);
        }
        else {
            const findCandidate = (candidate) => {
                return nextProps.candidates.find(updatedCandidate => {
                    return updatedCandidate.candidate_id === candidate.candidate_id;
                });
            };

            //need to update votes without re-sorting them
            let updatedCandidates = this.state.candidates.map(c => {
                let matchingCandidate = findCandidate(c);
                if (matchingCandidate) {
                    ['votedUp', 'votedDown', 'votedUpImages', 'votedDownImages', 'voted', 'images', 'candidate_name', 'notes']
                        .forEach(prop => {
                            c[prop] = matchingCandidate[prop];
                        });
                }
                else {
                    c.removed = true;
                }
                return c;
            });

            //merge in new candidates
            let newCandidates = [];
            if (updatedCandidates.length !== nextProps.candidates) {
                newCandidates = nextProps.candidates.reduce((done, updatedCandidate) => {
                    let missing = !updatedCandidates.find(existingCandidate => {
                        return existingCandidate.candidate_name === updatedCandidate.candidate_name;
                    });
                    if (missing) {
                        done.push(updatedCandidate);
                    }
                    return done;
                }, []);
            }

            this.setState({
                sortQueued: true,
                candidates: updatedCandidates.concat(newCandidates)
            })
        }
    }
    sortAndSetState(props) {
        props = props || this.props;
        this.setState({
            candidates: this.getSortedCandidates(props)
        });
    }
    lockSorting = () => {
        clearTimeout(this.state.sortTimeout);
        this.setState({
            canSort: false
        });
    };
    unlockSorting = () => {
        //wait for a bit before sorting, sometimes it quickly flips to unlocked and back so make sure it's been a while
        this.setState({
            sortTimeout: setTimeout(() => {
                if (this.state.sortQueued) {
                    this.sortAndSetState();
                }
                this.setState({
                    canSort: true,
                    sortQueued: false
                });
            }, 1000)
        });
    };
    resetVotes = () => {
        voterConduit.emit('resetVotes', this.props.race_id);
    };
    toggleView = () => {
        const detailed = !this.state.detailedView;
        this.setState({
            detailedView: detailed,
            candidates: this.getSortedCandidates(this.props, detailed)
        });
    };
    render() {
        const self = this,
            maxVotes = this.state.candidates.reduce((prev, two) => {
                const sum = a => a.votedUp.length + a.votedDown.length;
                return Math.max(prev, sum(two));
            }, 1), // min of one so we don't divide by zero
            candidates = this.state.candidates
                .map((c, index) => {
                    const toggleVote = (direction) => {
                            voterConduit.emit('toggleVote', this.props.race_id, c.candidate_id, direction);
                        },
                        toggleVoteUp = () => {
                            toggleVote('up');
                        },
                        toggleVoteDown = () => {
                            toggleVote('down')
                        },
                        removeCandidate = () => {
                            voterConduit.emit('removeCandidate', this.props.race_id, c.candidate_id);
                        };

                    return <Candidate detailedView={this.state.detailedView} removeCandidate={removeCandidate} toggleVoteUp={toggleVoteUp} toggleVoteDown={toggleVoteDown} {...c} maxVotes={maxVotes} key={index} />
                });

        function newCandidate(name) {
            voterConduit.emit('newCandidate', self.props.race_id, name);
        }

        return (
            <div className="candidate-list button-dock" onMouseEnter={this.lockSorting} onMouseMove={this.lockSorting} onMouseLeave={this.unlockSorting}>
                <div className="docked-buttons">
                    <button onClick={this.toggleView}>{this.state.detailedView ? 'Ranking' : 'Detailed'} View</button>
                    <button disabled={!Booker.voter.reset_votes} onClick={this.resetVotes} title="reset votes"><SVG id="reset-icon" /></button>
                </div>
                <h3>{this.props.race_name}</h3>
                <br />
                <NewCandidate newCandidate={newCandidate} />
                <If renderWhen={this.state.detailedView}>
                    <p>This list does not automatically sort by votes while in detailed view.</p>
                </If>
                {candidates}
            </div>
        )
    }
}

class NewCandidate extends React.Component {
    constructor(props) {
        super(props);
    }
    onKeyDown = (e) => {
        if (e.which === 13) {
            this.props.newCandidate(this.input.value);
            this.input.value = '';
        }
    };
    render() {
        const inputId = 'voter-new-candidate';

        if (!Booker.voter.add_candidate) {
            return null;
        }

        return (
            <div className="control">
                <label htmlFor={inputId}>New </label>
                <input id={inputId} ref={c => this.input = c} onKeyDown={this.onKeyDown} type="text" maxLength="50" />
            </div>
        );
    }
}

class Candidate extends React.Component {
	constructor(props) {
	    super(props);
	    this.nameInput = React.createRef();
	    this.notesInput = React.createRef();

	    this.state = {
            candidate_name_edited: false,
            notes_edited: false
        }
    }
    componentDidUpdate(oldProps) {
	    const newName = this.props.candidate_name,
            newNotes = this.props.notes;

	    if (newName !== oldProps.candidate_name) {
	        this.nameInput.current.value = newName;
            this.setState({
                candidate_name_edited: false
            })
        }

	    if (newNotes !== oldProps.notes) {
	        this.notesInput.current.value = newNotes;
	        this.setState({
                notes_edited: false
            })
        }
    }
    voteUp = () => {
        this.props.toggleVoteUp();
    };
    voteDown = () => {
        this.props.toggleVoteDown();
    };
    getImages(voters) {
        return voters
            .map((voter, i) => {
                return <UserBubble key={i} user={voter} />
            });
    }
    checkDirty(propName, e) {
        const newState = {};
        newState[propName + '_edited'] = this.props[propName] !== e.target.value;
        this.setState(newState);
    }
    saveCandidateName = () => {
        voterConduit.emit('updateCandidateName',
            this.props.race_id,
            this.props.candidate_id,
            this.nameInput.current.value
        );
    };
    saveNotes = () => {
        voterConduit.emit('updateNotes',
            this.props.race_id,
            this.props.candidate_id,
            this.notesInput.current.value
        );
    };
    nameKeyDown = e => {
        if (e.which === 13) {
            this.saveCandidateName();
        }
    };
    render() {
        const voters = `${this.props.candidate_name}\nAdded by: ${this.props.creator}`,
            getWidthPercent = votes => (votes / this.props.maxVotes) * 100 + '%',
            // votes cast in either direction
            numVotedUp = this.props.votedUp.length,
            numVotedDown = this.props.votedDown.length,
            //the current user's vote
            votedUp = this.props.voted === 'up',
            votedDown = this.props.voted === 'down',
            disabledState = this.props.removed || (!Booker.voter.remove_candidate && !this.props.created),
            voteButtonProps = {
                className: 'candidate-name',
                disabled: disabledState,
                title: voters
            },
            detailed = this.props.detailedView,
            candidateIdBase = `candidate-${this.props.race_id}-${this.props.candidate_id}-`,
            nameInputId = candidateIdBase + 'name',
            notesId = candidateIdBase + 'notes';

        return (
            <div className={"candidate" + (detailed ? ' detailed' : '')} data-candidate={this.props.candidate_id}>
                <div className="candidate-buttons">
                    <div className="up-down">
                        <button disabled={!Booker.voter.vote} className={'up' + (votedUp ? ' vote-cast' : '')} onClick={this.voteUp}><SVG id={'chevron-icon' + (this.props.voted === 'up' ? '-bold' : '')} /></button>
                        <button disabled={!Booker.voter.vote} className={'down' + (votedDown ? ' vote-cast' : '')} onClick={this.voteDown}><SVG id={'chevron-icon' + (this.props.voted === 'down' ? '-bold' : '')} /></button>
                    </div>
                    <div {...voteButtonProps}>
                        <div className="vote-bars">
                            <div className="up-bar vote-bar" style={{width: getWidthPercent(numVotedUp)}}>
                                <div className="voter-profile-images"><span className="vote-count">{numVotedUp}</span> {this.getImages(this.props.votedUp)}</div>
                            </div>
                            <div className="down-bar vote-bar" style={{width: getWidthPercent(numVotedDown)}}>
                                <div className="voter-profile-images"><span className="vote-count">{numVotedDown}</span>{this.getImages(this.props.votedDown)}</div>
                            </div>
                        </div>
                        <span className="candidate-text">
							<If renderWhen={detailed}>
                                <label className={'hidden ' + nameInputId}>Candidate Name</label>
                                <input ref={this.nameInput} onKeyDown={this.nameKeyDown} defaultValue={this.props.candidate_name} onKeyUp={this.checkDirty.bind(this, 'candidate_name')}/>
                                {this.state.candidate_name_edited && <button onClick={this.saveCandidateName}>Save</button>}
                            </If>
                            {!detailed && this.props.candidate_name}
                        </span>
                    </div>
                    <button className="candidate-remove" onClick={this.props.removeCandidate} disabled={disabledState} title="Remove this candidate">
                        <SVG id="x-icon" />
                    </button>
                </div>
                <If renderWhen={detailed}>
                    <CandidateImages race_id={this.props.race_id} candidate_id={this.props.candidate_id} images={this.props.images}/>
                    <label htmlFor={notesId}>Notes</label>
                    <textarea ref={this.notesInput} id={notesId} className="candidate-notes" onKeyUp={this.checkDirty.bind(this, 'notes')} defaultValue={this.props.notes} />
                    {this.state.notes_edited && <button onClick={this.saveNotes}>Save</button>}
                </If>
            </div>
        )
    }
}

class CandidateImages extends React.Component {
    constructor(props) {
        super(props);
        const propsHasImages = this.props.images.length > 0;
        this.state = {
            currentImage: propsHasImages ? this.props.images[0].image_id : null,
        };
    }
    componentDidUpdate() {
        const propsHasImages = this.props.images.length > 0;
        if (this.state.currentImage === null && propsHasImages) {
            this.setState({
                currentImage: this.props.images[0].image_id
            })
        }
    }
    upload (e) {
        const file = e.target.files.item(0);
        fetch(`/voter/${this.props.race_id}/${this.props.candidate_id}/upload`, {
            method: 'POST',
            body: file
        })
            .then(response => {
            	const errorToast = msg => Toaster.add({type: 'text', text: 'Error! ' + msg});

                if(response.status === 413) {
                    errorToast('That image is too big!');
                }
                else if (!response.ok) {
                    errorToast(response.statusText)
                }
            });
        e.target.value = '';
    }
    pickImage(image_id) {
        this.setState({
            currentImage: image_id
        });
    }
    toggleMaximize = () => {
        this.setState({maximized: !this.state.maximized});
    };
    deleteMainImage = (e) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to remove this image?')) {
            voterConduit.emit('removeImage', this.state.currentImage);

            //find the first image that's not the current one, otherwise we'll be showing an image that's already been deleted
            const nextImage = this.props.images.find(image => image.image_id !== this.state.currentImage);
            this.setState({
                currentImage: nextImage ? nextImage.image_id : null
            })
        }
    };
    render() {
        const images = this.props.images.map(image => {
            const imageId = image.image_id;
            return <img key={imageId} onClick={this.pickImage.bind(this, imageId)} src={`/voter/image/${imageId}`} />
        });
        const candidateIdBase = `candidate-${this.props.race_id}-${this.props.candidate_id}-`,
            uploadInputId = candidateIdBase + 'upload';

        return (
            <div className="candidate-images">
                <If renderWhen={this.props.images.length > 0}>
                    <div className={'main-image-container ' + (this.state.maximized ? 'maximized' : '')} onClick={this.toggleMaximize}>
						<If renderWhen={Booker.voter.remove_image}>
                            <div className="docked-buttons">
                                <button onClick={this.deleteMainImage} title="Delete this image"><SVG id="x-icon"/></button>
                            </div>
                        </If>
                        {this.state.currentImage !== null && <img className="main-image" src={`/voter/image/${this.state.currentImage}`}/>}
                    </div>
                </If>
                <If renderWhen={this.props.images.length > 1}>
                    <div className="image-tray">
                        {images}
                    </div>
                </If>
                <If renderWhen={Booker.voter.add_image}>
                    <div>
                        <label className="upload-candidate-image" htmlFor={uploadInputId}>Attach an image</label>
                        <input id={uploadInputId} className='hidden' onChange={this.upload.bind(this)} type="file" accept="image/png, image/jpeg" />
                    </div>
                </If>
            </div>
        )
    }
}

module.exports = Voter;
