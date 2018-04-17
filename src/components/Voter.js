import React from 'react';
import SVG from './SVG';
import {Link} from 'react-router-dom';
const Conduit = require('../util/conduit'),
    voterConduit = new Conduit(socket, 'voter');

let cachedState = {
    activeRace: null,
    races: []
};
const Voter = React.createClass({
    getInitialState: function() {
        return cachedState;
    },
    componentWillMount: function() {
        voterConduit.on({
            refresh: races => {
                cachedState.races = races;
                if (races.length) {
                    const updatedRace = races.find(r => {
                        return r.id === (cachedState.activeRace || {}).id;
                    });
                    cachedState.activeRace = updatedRace || races[0];
                }
                this.setState(cachedState);
            }
        });
        voterConduit.emit('init');
    },
    componentWillUnmount: function() {
        voterConduit.destroy();
    },
    switchRace: function(id) {
        const race = this.state.races.find(race => {
            return race.id === id;
        });
        cachedState.activeRace = race;
        this.setState({
            activeRace: race
        });
    },
    render: function() {
        return (
            <section className="panel voter-panel">
                <div className="panel-title">
                    <h2>Voter</h2>
                    <SVG id="voter-icon" />
                </div>
                <div className="sub-panel voter">
                    <RaceList {...this.state} switchRace={this.switchRace} />
                    {this.state.activeRace ?
                        <CandidateList {...this.state.activeRace} />
                        : null}
                </div>
            </section>
        );
    }
});

const RaceList = React.createClass({
    componentDidMount: function() {
        this.updateRaceSelection();
    },
    componentDidUpdate: function() {
        this.updateRaceSelection();
    },
    updateRaceSelection: function() {
        if (this.props.activeRace) {
            this.select.value = this.props.activeRace.id;
        }
    },
    newRaceKeyDown: function(e) {
        if (e.which === 13) {
            voterConduit.emit('newRace', e.target.value);
            e.target.value = '';
        }
    },
    switchRace: function() {
        this.props.switchRace(this.select.value);
    },
    removeRace: function() {
        if (confirm(`Really remove ${this.props.activeRace.name}?`)) {
            voterConduit.emit('removeRace', this.props.activeRace.id);
        }
    },
    render: function() {
        const races = this.props.races.map((race, index) => {
                return <option value={race.id} key={index}>{race.name}</option>
            }),
            raceSwitcherId = 'voter-race-switcher',
            raceInputId = 'voter-new-race';

        return (
            <div className="race-list">
                <div className="control">
                    <label htmlFor={raceInputId}>New race</label>
                    <input id={raceInputId} onKeyDown={this.newRaceKeyDown} type="text" maxLength="20"/>
                </div>
                <div className="control">
                    <label htmlFor={raceSwitcherId}>View</label>
                    <select ref={c => this.select = c} id={raceSwitcherId} onChange={this.switchRace}>
                        {races}
                    </select>
                    <button className="race-remove" onClick={this.removeRace}>
                        <SVG id="x-icon" />
                    </button>
                </div>
            </div>
        );
    }
});

const CandidateList = React.createClass({
    getInitialState: function() {
        return {
            candidates: this.getSortedCandidates(this.props),
            canSort: true,
            sortQueued: false
        }
    },
    getSortedCandidates: function(props) {
        return props.candidates.sort((a, b) => {
            return (b.votedUp.length  - b.votedDown.length) - (a.votedUp.length - a.votedDown.length);
        })
    },
    componentWillReceiveProps: function(nextProps) {
        //allow immediate sorting and resetting candidates if the they're not trying to vote or if the active race changes
        if (this.state.canSort || this.props.name !== nextProps.name) {
            this.sortAndSetState(nextProps);
        }
        else {
            const findCandidate = (candidate) => {
                return nextProps.candidates.find(updatedCandidate => {
                    return updatedCandidate.name === candidate.name;
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
                        return existingCandidate.name === updatedCandidate.name;
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
    },
    sortAndSetState: function(props) {
        props = props || this.props;
        this.setState({
            candidates: this.getSortedCandidates(props)
        });
    },
    lockSorting: function() {
        this.setState({
            canSort: false
        });
    },
    unlockSorting: function() {
        if (this.state.sortQueued) {
            this.sortAndSetState();
        }
        this.setState({
            canSort: true,
            sortQueued: false
        });
    },
    resetVotes: function() {
        voterConduit.emit('resetVotes', this.props.id);
    },
    render: function() {
        const self = this,
            maxVotes = this.state.candidates.reduce((prev, two) => {
                const sum = a => a.votedUp.length + a.votedDown.length;
                return Math.max(prev, sum(two));
            }, 1), // min of one so we don't divide by zero
            candidates = this.state.candidates.map((c, index) => {
                const toggleVote = (direction) => {
                        voterConduit.emit('toggleVote', this.props.id, c.name, direction);
                    },
                    toggleVoteUp = () => {
                        toggleVote('up');
                    },
                    toggleVoteDown = () => {
                        toggleVote('down')
                    },
                    removeCandidate = () => {
                        voterConduit.emit('removeCandidate', this.props.id, c.name);
                    };

                return <Candidate removeCandidate={removeCandidate} toggleVoteUp={toggleVoteUp} toggleVoteDown={toggleVoteDown} {...c} maxVotes={maxVotes} key={index} />
            });

        function newCandidate(name) {
            voterConduit.emit('newCandidate', self.props.id, name);
        }

        return (
            <div className="candidate-list button-dock" onMouseEnter={this.lockSorting} onMouseMove={this.lockSorting} onMouseLeave={this.unlockSorting}>
                <div className="docked-buttons">
                    <button onClick={this.resetVotes} title="Reset Votes"><SVG id="reset-icon" /></button>
                </div>
                <h3>{this.props.name}</h3>
                <br />
                <NewCandidate newCandidate={newCandidate} />
                {candidates}
            </div>
        )
    }
});

const NewCandidate = React.createClass({
    onKeyDown: function(e) {
        if (e.which === 13) {
            this.props.newCandidate(this.input.value);
            this.input.value = '';
        }
    },
    render: function() {
        const inputId = 'voter-new-candidate';

        return (
            <div className="control">
                <label htmlFor={inputId}>New </label>
                <input id={inputId} ref={c => this.input = c} onKeyDown={this.onKeyDown} type="text" maxLength="50" />
            </div>
        );
    }
});

const Candidate = React.createClass({
    voteUp: function() {
        this.props.toggleVoteUp();
    },
    voteDown: function() {
        this.props.toggleVoteDown();
    },
    getImages: function(voters) {
        return voters
            .map((voter, i) => {
                return <img className="voter-profile-image" src={voter.photo} title={voter.name} key={i} />
            });
    },
    getNames: function(voters) {
        return voters.map(voter => voter.name);
    },
    render: function() {
        const voters = `${this.props.name}\nUp: ${this.getNames(this.props.votedUp).join(', ')}\nDown: ${this.getNames(this.props.votedDown).join(', ')}`,
            getWidthPercent = votes => (votes / this.props.maxVotes) * 100 + '%',
            votedUp = this.props.votedUp.length,
            votedDown = this.props.votedDown.length,
            disabledState = this.props.removed,
            voteButtonProps = {
                className: 'candidate-name',
                disabled: disabledState,
                title: voters
            };
        return (
            <div className="candidate">
                <div className="candidate-buttons">
                    <div className="up-down">
                        <button className="up" onClick={this.voteUp}><SVG id={'chevron-icon' + (this.props.voted === 'up' ? '-bold' : '')} /><span className="vote-count">{votedUp}</span></button>
                        <button className="down" onClick={this.voteDown}><SVG id={'chevron-icon' + (this.props.voted === 'down' ? '-bold' : '')} /><span className="vote-count">{votedDown}</span></button>
                    </div>
                    <div {...voteButtonProps}>
                        <div className="vote-bars">
                            <div className="up-bar vote-bar" style={{width: getWidthPercent(votedUp)}}><div className="voter-profile-images">{this.getImages(this.props.votedUp)}</div></div>
                            <div className="down-bar vote-bar" style={{width: getWidthPercent(votedDown)}}><div className="voter-profile-images">{this.getImages(this.props.votedDown)}</div></div>
                        </div>
                        <span className="candidate-text">{(votedUp - votedDown) + ' • ' + this.props.name}</span>
                    </div>
                    <button className="candidate-remove" onClick={this.props.removeCandidate} disabled={disabledState}>
                        <SVG id="x-icon" />
                    </button>
                </div>
            </div>
        )
    }
});

module.exports = Voter;
