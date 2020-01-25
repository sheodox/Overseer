const React = require('react');

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

module.exports = RaceList;
