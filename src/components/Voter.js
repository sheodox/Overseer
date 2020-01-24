const React = require('react'),
	Gaze = require('./Gaze'),
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

function uploadPicture(race_id, candidate_id, file) {
    fetch(`/voter/${race_id}/${candidate_id}/upload`, {
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
}
let cachedState = {
    activeRace: null,
    races: [],
    loaded: false,
    detailedView: false
};
class Voter extends React.Component {
    constructor(props) {
        super(props);
        this.state = cachedState;
    }
    static getDerivedStateFromProps(props, state) {
        return {
            detailedView: props.match.params.viewMode === 'detailed'
        }
    }
    getRaceRoute(id) {
        return `/w/voter/${id}/${this.props.match.params.viewMode || 'ranking'}`;
    }
    componentDidMount() {
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
                const raceRoute = this.getRaceRoute(
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
        this.props.history.push(this.getRaceRoute(id));
    };
    toggleViewMode = () => {
        const nextView = this.state.detailedView ? 'ranking' : 'detailed';
        this.props.history.push(`${nextView}`)
    };
    newRaceKeyDown = (e) => {
        if (e.which === 13) {
            voterConduit.emit('newRace', e.target.value);
            e.target.value = '';
        }
    };
    render() {
        if (!Booker.voter.view) {
            return <Redirect to="/" />;
        }
        const raceInputId = 'voter-new-race';
        let newRace;
        if (Booker.voter.add_race) {
            newRace = <div className="control">
                <label htmlFor={raceInputId}>New race</label>
                <input id={raceInputId} onKeyDown={this.newRaceKeyDown} type="text" maxLength="50" placeholder="enter a new category name to vote on"/>
            </div>
        }

        return (
            <section className="panel voter-panel">
                <div className="panel-title">
                    <SVG id="voter-icon" />
                    <h2>Voter</h2>
                </div>
                <div className="sub-panel voter">
                    <Loading renderWhen={!this.state.loaded}/>
                    <If renderWhen={this.state.loaded}>
                        {newRace}
						<div className="sub-panel row">
                            <RaceList {...this.state} switchRace={this.switchRace} />
                            {this.state.activeRace ?
                                <CandidateList {...this.state.activeRace} detailedView={this.state.detailedView} toggleViewMode={this.toggleViewMode}/>
                                : null}
                        </div>
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
    switchRace = () => {
        this.props.switchRace(parseInt(this.select.value, 10));
    };
    render() {
        const races = this.props.races.map((race, index) => {
                return <option value={race.race_id} key={index}>{race.race_name}</option>
            }),
            raceSwitcherId = 'voter-race-switcher';

        return (
            <div className="race-list">
                <div className="control">
                    <label htmlFor={raceSwitcherId}>Viewing Race</label>
                    <select ref={c => this.select = c} id={raceSwitcherId} onChange={this.switchRace}>
                        {races}
                    </select>
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
        };

    }
    getSortedCandidates(props, asDetailed) {
        //when in detailed row, sort by the candidate id, otherwise sort by vote ranking.
        //a user is more likely to be actively spending time looking through a detailed list,
        //so re-sorting things would be confusing.
        //need to also check to make sure asDetailed isn't defined, otherwise it won't instantly sort from toggling the view
        if (asDetailed || (typeof asDetailed === 'undefined' && this.state && this.props.detailedView)) {
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
        if (this.state.canSort || this.props.race_id !== nextProps.race_id || this.props.detailedView !== nextProps.detailedView) {
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
                    ['votedUp', 'votedDown', 'votedUpImages', 'votedDownImages', 'voted', 'images', 'candidate_name', 'notes', 'links']
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
            candidates: this.getSortedCandidates(props, props.detailedView)
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
        if (confirm(`Are you sure you want to reset votes for ${this.props.race_name}?`)) {
            voterConduit.emit('resetVotes', this.props.race_id);
        }
    };
    removeRace = () => {
        if (confirm(`Really remove ${this.props.race_name}?`)) {
            voterConduit.emit('removeRace', this.props.race_id);
        }
    };
    toggleView = () => {
        this.props.toggleViewMode();
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

                    return <Candidate detailedView={this.props.detailedView} removeCandidate={removeCandidate} toggleVoteUp={toggleVoteUp} toggleVoteDown={toggleVoteDown} {...c} maxVotes={maxVotes} key={index} />
                });

        function newCandidate(name) {
            voterConduit.emit('newCandidate', self.props.race_id, name);
        }

        return (
            <div className="candidate-list button-dock" onMouseEnter={this.lockSorting} onMouseLeave={this.unlockSorting}>
                <div className="centered-buttons">
                    <button onClick={this.toggleView}>
                        <If renderWhen={!this.props.detailedView}>
                            <SVG id="details-icon" />
                            Detailed View
                        </If>
                        <If renderWhen={this.props.detailedView}>
                            <SVG id="ranking-icon" />
                            Ranking View
                        </If>
                    </button>
					<If renderWhen={Booker.voter.reset_votes}>
                        <button onClick={this.resetVotes}><SVG id="reset-icon" />Reset Votes</button>
                    </If>
                    <If renderWhen={Booker.voter.remove_race}>
                        <button className="race-remove" onClick={this.removeRace}>
                            <SVG id="x-icon" />Remove Race
                        </button>
                    </If>
                </div>
                <br />
                <NewCandidate newCandidate={newCandidate} />
                <If renderWhen={this.props.detailedView}>
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
                <label htmlFor={inputId}>New item </label>
                <input id={inputId} ref={c => this.input = c} onKeyDown={this.onKeyDown} type="text" maxLength="50" placeholder="add something to vote for"/>
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
            notes_edited: false,
            view: 'overview'
        }
    }
    componentDidUpdate(oldProps) {
	    const newName = this.props.candidate_name,
            newNotes = this.props.notes;

	    if (newName !== oldProps.candidate_name && this.nameInput.current) {
	        this.nameInput.current.value = newName;
            this.setState({
                candidate_name_edited: false
            })
        }

	    if (newNotes !== oldProps.notes && this.notesInput.current) {
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
    switchView = view => {
        this.setState({ view });
    };
    imagePasted = e => {
        const file = e.clipboardData.files[0];
        //ignore it if a file wasn't pasted, could just be pasting text
        if (file) {
            e.preventDefault();
            if (['image/png', 'image/jpeg'].includes(file.type)) {
                uploadPicture(this.props.race_id, this.props.candidate_id, file);
            } else {
                Toaster.add({type: 'text', text: 'Invalid file type!'})
            }
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
            notesId = candidateIdBase + 'notes',
            candidateProps = {
                race_id: this.props.race_id,
                candidate_id: this.props.candidate_id
            },
            notesPlaceholder = 'Add any notes you want.' + (Booker.voter.add_image ? ' Or paste an image here to attach it.' : '');

        return (
            <div className={"candidate" + (detailed ? ' detailed sub-panel' : '')} data-candidate={this.props.candidate_id}>
                <div className="candidate-buttons sub-panel">
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
                    <div className="candidate-view-switchers">
                        <button onClick={this.switchView.bind(this, 'overview')} disabled={this.state.view === 'overview'}>Overview</button>
                        <button onClick={this.switchView.bind(this, 'links')} disabled={this.state.view === 'links'}>Links</button>
                    </div>

                    <If renderWhen={this.state.view === 'overview'}>
                        <CandidateImages {...candidateProps} images={this.props.images}/>

                        <label htmlFor={notesId}>Notes</label>
                        <textarea ref={this.notesInput} id={notesId} className="candidate-notes" onPaste={this.imagePasted} onKeyUp={this.checkDirty.bind(this, 'notes')} defaultValue={this.props.notes} placeholder={notesPlaceholder} />
                        <div className="buttons-on-right">
                            {this.state.notes_edited && <button onClick={this.saveNotes}>Save</button>}
                        </div>
                    </If>
                    {this.state.view === 'links' && <CandidateLinks {...candidateProps} links={this.props.links} />}

                </If>
            </div>
        )
    }
}

class CandidateLinks extends React.Component {
    constructor(props) {
        super(props);
        this.textRef = React.createRef();
        this.hrefRef = React.createRef();
    }
    submit = e => {
        e.preventDefault();
        console.log(e);

        voterConduit.emit(
            'addLink',
			this.props.race_id,
			this.props.candidate_id,
			this.textRef.current.value,
            this.hrefRef.current.value
        );
        e.target.reset();
    };
    delete = href => {
        voterConduit.emit(
            'removeLink',
            this.props.race_id,
            this.props.candidate_id,
			href
        );
    };
    render() {
        const baseId = `candidate-${this.props.race_id}-${this.props.candidate_id}-links-`,
            linkNameId = baseId + 'name',
            linkHrefId = baseId + 'href',
            links = this.props.links.map((link, index) => {
                const href = /^https?:\/\//.test(link.link_href || '') ? link.link_href : '';
                return <li key={baseId + index}>
                    <a href={href} target='_blank' rel="noreferrer noopener" title={href}>{link.link_text || href || 'invalid link!'}</a>
                    <button onClick={this.delete.bind(this, href)} title="Delete this link">
                        <SVG id='x-icon' />
                    </button>
                </li>
            });

        return <div>
			<ul className="candidate-links-list">
                {links}
            </ul>
            <form onSubmit={this.submit}>
                <div className="control">
                    <label htmlFor={linkNameId}>Link Text</label>
                    <input id={linkNameId} ref={this.textRef} placeholder="optional description for this link" />
                </div>
                <div className="control">
                    <label htmlFor={linkHrefId}>Link URL</label>
                    <input id={linkHrefId} ref={this.hrefRef} placeholder="https://..."/>
                </div>
                <div className="buttons-on-right">
                    <input type="submit" value="Add Link"/>
                </div>
            </form>
        </div>
    }
}


class CandidateImages extends React.Component {
    constructor(props) {
        super(props);
    }
    upload (e) {
        const file = e.target.files.item(0);
        uploadPicture(this.props.race_id, this.props.candidate_id, file);
        e.target.value = '';
    }
    deleteImage = (id) => {
        if (confirm('Are you sure you want to remove this image?')) {
            voterConduit.emit('removeImage', id);
        }
    };
    render() {
        const candidateIdBase = `candidate-${this.props.race_id}-${this.props.candidate_id}-`,
            uploadInputId = candidateIdBase + 'upload';

    	return (
    		<React.Fragment>
                <Gaze source="voter" images={this.props.images.map(i => i.image_id)} canDelete={Booker.voter.remove_image} onDelete={this.deleteImage}/>

                <If renderWhen={Booker.voter.add_image}>
                    <div className="centered-buttons">
                        <label className="upload-candidate-image as-button" htmlFor={uploadInputId}>Attach an image</label>
                        <input id={uploadInputId} className='hidden' onChange={this.upload.bind(this)} type="file" accept="image/png, image/jpeg" />
                    </div>
                </If>
            </React.Fragment>
        );
    }
}

module.exports = Voter;
