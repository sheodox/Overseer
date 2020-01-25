const React = require('react'),
	If = require('../If'),
	SVG = require('../SVG'),
	CandidateImages = require('./CandidateImages'),
	CandidateLinks = require('./CandidateLinks'),
	UserBubble = require('../UserBubble'),
	Conduit = require('../../util/conduit'),
	uploadPicture = require('./uploadPicture'),
	voterConduit = new Conduit(socket, 'voter');

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

module.exports = Candidate;
