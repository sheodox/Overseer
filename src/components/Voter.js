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
    componentWillMount() {
        voterConduit.on({
            refresh: races => {
                cachedState.races = races;
                if (races.length) {
                    const updatedRace = races.find(r => {
                        return r.race_id === (cachedState.activeRace || {}).race_id;
                    });
                    cachedState.activeRace = updatedRace || races[0];
                }
                else {
                    //blank out the candidate list if all races are gone
                    cachedState.activeRace = null;
                }
                cachedState.loaded = true;
                this.setState(cachedState);
            }
        });
        voterConduit.emit('init');
        AppControl.title('Voter');
    }
    componentWillUnmount() {
        voterConduit.destroy();
    }
    switchRace = (id) => {
        const race = this.state.races.find(race => {
            return race.race_id === id;
        });
        cachedState.activeRace = race;
        this.setState({
            activeRace: race
        });
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
            sortQueued: false
        };

    }
    getSortedCandidates(props) {
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
                    ['votedUp', 'votedDown', 'votedUpImages', 'votedDownImages', 'voted']
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
        this.setState({
            canSort: false
        });
    };
    unlockSorting = () => {
        if (this.state.sortQueued) {
            this.sortAndSetState();
        }
        this.setState({
            canSort: true,
            sortQueued: false
        });
    };
    resetVotes = () => {
        voterConduit.emit('resetVotes', this.props.race_id);
    };
    render() {
        const self = this,
            maxVotes = this.state.candidates.reduce((prev, two) => {
                const sum = a => a.votedUp.length + a.votedDown.length;
                return Math.max(prev, sum(two));
            }, 1), // min of one so we don't divide by zero
            candidates = this.state.candidates.map((c, index) => {
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

                return <Candidate removeCandidate={removeCandidate} toggleVoteUp={toggleVoteUp} toggleVoteDown={toggleVoteDown} {...c} maxVotes={maxVotes} key={index} />
            });

        function newCandidate(name) {
            voterConduit.emit('newCandidate', self.props.race_id, name);
        }

        return (
            <div className="candidate-list button-dock" onMouseEnter={this.lockSorting} onMouseMove={this.lockSorting} onMouseLeave={this.unlockSorting}>
                <div className="docked-buttons">
                    <button disabled={!Booker.voter.reset_votes} onClick={this.resetVotes} title="reset votes"><SVG id="reset-icon" /></button>
                </div>
                <h3>{this.props.race_name}</h3>
                <br />
                <NewCandidate newCandidate={newCandidate} />
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
            };
        return (
            <div className="candidate">
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
                        <span className="candidate-text">{this.props.candidate_name}</span>
                    </div>
                    <button className="candidate-remove" onClick={this.props.removeCandidate} disabled={disabledState}>
                        <SVG id="x-icon" />
                    </button>
                </div>
            </div>
        )
    }
}

module.exports = Voter;
