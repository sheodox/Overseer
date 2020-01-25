const React = require('react');

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

module.exports = NewCandidate;
