const React = require('react'),
	If = require('../If'),
	SVG = require('../SVG'),
	Candidate = require('./Candidate'),
	NewCandidate = require('./NewCandidate'),
	Conduit = require('../../util/conduit'),
	voterConduit = new Conduit(socket, 'voter'),
	voteWeights = {
		up: 1,
		down: 1.1
	};

class CandidateList extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			candidates: this.getSortedCandidates(this.props, props.detailedView),
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

module.exports = CandidateList;
