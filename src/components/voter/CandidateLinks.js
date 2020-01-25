const React = require('react'),
	SVG = require('../SVG'),
	Conduit = require('../../util/conduit'),
	voterConduit = new Conduit(socket, 'voter');

class CandidateLinks extends React.Component {
	constructor(props) {
		super(props);
		this.textRef = React.createRef();
		this.hrefRef = React.createRef();
		this.state = {
			suggesting: false
		};
	}
	submit = e => {
		e.preventDefault();

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
	getSuggestion = (e) => {
		//prevent the form submitting
		e.preventDefault();
		this.setState({
			suggesting: true
		});

		voterConduit.emit('suggestLinkText', this.hrefRef.current.value, (suggested) => {
			this.textRef.current.value = suggested;

			this.setState({
				suggesting: false
			});
		});
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
					<button onClick={this.getSuggestion}>Suggest Link Text</button>
					<input type="submit" value="Add Link" disabled={this.state.suggesting}/>
				</div>
			</form>
		</div>
	}
}

module.exports = CandidateLinks;
