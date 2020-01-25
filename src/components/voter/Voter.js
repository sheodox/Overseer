const React = require('react'),
	RaceList = require('./RaceList'),
    CandidateList = require('./CandidateList'),
    SVG = require('../SVG'),
    Loading = require('../Loading'),
    If = require('../If'),
    {Redirect} = require('react-router-dom'),
    Conduit = require('../../util/conduit'),
    voterConduit = new Conduit(socket, 'voter');

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


module.exports = Voter;
