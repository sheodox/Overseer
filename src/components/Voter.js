import React from 'react';
import SVG from './SVG';
import {connect} from 'react-redux';
import actions from '../actions/act-voter-client';
import {Link} from 'react-router';

const Voter = React.createClass({
    render: function() {
        return (
            <section className="panel">
                <div className="panel-title">
                    <h2>Voter</h2>
                    <SVG id="voter-icon" />
                </div>
                <div className="sub-panel voter">
                    <div className={this.props.username ? 'hidden' : ''}>
                        <Link to="/w/settings">Please set your username first!</Link>
                    </div>
                    <div className={this.props.username ? '' : 'hidden'}>
                        <RaceList activeRace={this.props.activeRace} races={this.props.races} newRace={this.props.newRace} switchRace={this.props.switchRace} />
                        {this.props.activeRace ?
                            <CandidateList {...this.props} {...this.props.activeRace} />
                            : null}
                    </div>
                </div>
            </section>
        );
    }
});

const RaceList = React.createClass({
    getInitialState: function() {
        return {
            creatingRace: !this.props.races.length,
        }
    },
    componentDidMount: function() {
        if (this.props.activeRace) {
            this.select.value = this.props.activeRace.id;
        }
    },
    toggleCreate: function() {
        this.setState({
            creatingRace: !this.state.creatingRace
        });
    },
    newRaceKeyDown: function(e) {
        if (e.which === 13) {
            this.props.newRace(e.target.value);
            e.target.value = '';
        }
    },
    switchRace: function() {
        this.props.switchRace(this.select.value)
    },
    render: function() {
        const races = this.props.races.map((race, index) => {
                return <option value={race.id} key={index}>{race.name}</option>
            }),
            raceSwitcherId = 'voter-race-switcher',
            raceInputId = 'voter-new-race';

        return (
            <div>
                <div className="control">
                    <label htmlFor={raceInputId}>New race</label>
                    <input id={raceInputId} onKeyDown={this.newRaceKeyDown} type="text" maxLength="20"/>
                </div>
                <div className="control">
                    <label htmlFor={raceSwitcherId}>View</label>
                    <select ref={c => this.select = c} id={raceSwitcherId} onChange={this.switchRace}>
                        {races}
                    </select>
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
            return b.voters.length - a.voters.length;
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
                    c.voters = matchingCandidate.voters;
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
    render: function() {
        const self = this,
            candidates = this.state.candidates.map((c, index) => {
                const toggleVote = () => {
                        this.props.toggleVote(this.props.id, c.name, this.props.sessionId);
                    },
                    removeCandidate = () => {
                        this.props.removeCandidate(this.props.id, c.name);
                    },
                    voted = c.voters.includes(this.props.username);

                return <Candidate voted={voted} removeCandidate={removeCandidate} toggleVote={toggleVote} {...c} key={index} />
            });

        function newCandidate(name) {
            self.props.newCandidate(self.props.id, name);
        }

        return (
            <div className="candidate-list" onMouseEnter={this.lockSorting} onMouseMove={this.lockSorting} onMouseLeave={this.unlockSorting}>
                <h3>{this.props.name}</h3>
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
                <input id={inputId} ref={c => this.input = c} onKeyDown={this.onKeyDown} type="text" maxLength="20" />
            </div>
        );
    }
});

const Candidate = React.createClass({
    getInitialState: function() {
        return {
            expanded: false
        }
    },
    toggleExpand: function() {
        this.setState({
            expanded: !this.state.expanded
        });
    },
    render: function() {
        const voters = this.props.voters.join(', '),
            disabledState = this.props.removed,
            voteButtonProps = {
                className: 'vote-button illuminated-target ' + (this.props.voted ? 'on' : 'off'),
                onClick: this.props.toggleVote,
                disabled: disabledState
            };
        return (
            <div className="candidate">
                <div className="candidate-buttons">
                    <button {...voteButtonProps}>
                        {this.props.voters.length} - {this.props.name}
                    </button>
                    <button className="candidate-remove" onClick={this.props.removeCandidate} disabled={disabledState}>
                        <SVG id="x-icon" />
                    </button>
                </div>
                <div className={'candidate-voters ' + (this.state.expanded ? '' : 'hidden')} title={voters}>{voters}</div>
            </div>
        )
    }
});

function mapStateToProps(state) {
    let voter = state.voter;
    let settings = state.settings;
    return {
        username: settings.username,
        sessionId: settings.sessionId,
        activeRace: voter.races.find(r => {return r.id ===  voter.activeRace}),
        races: voter.races
    };
}


function mapDispatchToProps(dispatch) {
    return {
        newRace: (name) => {
            socket.emit('voter/newRace', name);
        },
        newCandidate: (raceId, name) => {
            socket.emit('voter/newCandidate', raceId, name)
        },
        switchRace: (raceId) => {
            dispatch(actions.switchRace(raceId));
        },
        toggleVote: (raceId, candidateId, sessionId) => {
            socket.emit('voter/toggleVote', raceId, candidateId, sessionId);
        },
        removeCandidate: (raceId, candidateId) => {
            socket.emit('voter/removeCandidate', raceId, candidateId);
        }
    };
}

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Voter);
