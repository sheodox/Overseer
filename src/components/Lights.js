const React = require('react'),
    SVG = require('./SVG'),
    Loading = require('./Loading'),
    Conduit = require('../util/conduit'),
    lightsConduit = new Conduit(socket, 'lights'),
    {Redirect} = require('react-router-dom');

let cachedStates = [];

class Lights extends React.Component {
    constructor(props) {
        super(props);
        this.state = {states: cachedStates};
    }
    componentWillMount() {
        lightsConduit.on({
            refresh: states => {
                cachedStates = states;
                this.setState({states: states});
            }
        });
        lightsConduit.emit('init');
        AppControl.title('Lights');
    }
    componentWillUnmount() {
        lightsConduit.destroy();
    }
    render() {
        if (!Booker.lights.use) {
            return <Redirect to="/" />;
        }

        const groups = this.state.states.map((s, i) => {
            return <LightGroup {...s} key={i} />
        }),
            groupList = <ul>{groups}</ul>,
            content = this.state.states.length ? groupList : <Loading />;
        return (
            <section className="panel">
                <div className="panel-title">
                    <h2>Lights</h2>
                    <SVG id="light-icon" />
                </div>
                {content}
            </section>
        );
    }
}

class LightGroup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            detailsExpanded: false
        };
    }
    toggle = () => {
        lightsConduit.emit('toggle', this.props.id);
    };
    toggleDetails = () => {
        this.setState({
            detailsExpanded: !this.state.detailsExpanded
        });
    };
    render() {
        let toggleClass = 'lg-toggle illuminated-target ' + (this.props.on ? 'on' : 'off'),
            expandedClass = this.state.detailsExpanded ? ' expanded' : '',
            detailsClass = 'lg-details' + expandedClass,
            expandButtonClass = 'lg-details-toggle' + expandedClass;

        return (
            <li className="sub-panel">
                <div className="light-group">
                    <div className="lg-button-group">
                        <button className={toggleClass} onClick={this.toggle}>
                            {this.props.name}
                        </button>
                        <button className={expandButtonClass} onClick={this.toggleDetails}>
                            <SVG id="chevron-icon" />
                        </button>
                    </div>
                    <div className={detailsClass}>
                        <BrightnessSlider {...this.props} />
                    </div>
                </div>
            </li>
        )
    }
}

class BrightnessSlider extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            //if the user is currently dragging the slider
            adjusting: false,
            //timeout for emitting updates to the server so we don't send updates for every change event (every tick sometimes)
            updateTimeout: null
        };
    }
    changeBrightness = (e) => {
        //don't want to try to adjust the brightness on every increment
        if (!this.state.updateTimeout) {
            e.persist();
            this.setState({
                updateTimeout: setTimeout(() => {
                    lightsConduit.emit('brightness', this.props.id, e.target.value);

                    //allow later updates
                    this.setState({updateTimeout: null});
                }, 500)
            });
        }
    };
    startAdjust = () => {
        this.setState({adjusting: true});
    };
    stopAdjust = () => {
        this.setState({adjusting: false});
    };
    shouldComponentUpdate(nextProps) {
        //don't try to re-render and set brightness again until the user is done messing with it and we have an update
        //allows brightness to be updated (and synced) by other clients without jankily setting the value while they're dragging
        return (this.props.brightness !== nextProps.brightness) && !this.state.adjusting;
    }
    componentDidUpdate() {
        this.slider.value = this.props.brightness;
    }
    render() {
        var inputAttrs = {
                type: 'range',
                min: '0',
                max: '254',
                id: 'lg-slide-' + this.props.id,
                className: "lg-brightness-slide",
                defaultValue: this.props.brightness
            },
            events = {
                onChange: this.changeBrightness,
                onMouseDown: this.startAdjust,
                onMouseUp: this.stopAdjust,
                onTouchStart: this.startAdjust,
                onTouchEnd: this.stopAdjust
            };

        return (
            <div>
                <label htmlFor={inputAttrs.id}>Brightness</label>
                <br/>
                <input ref={c => this.slider = c} {...inputAttrs} {...events} />
            </div>
        )
    }
}

module.exports = Lights;
