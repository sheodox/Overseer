import React from 'react';
import SVG from './SVG';
const Conduit = require('../util/conduit');
const lightsConduit = new Conduit(socket, 'lights');
const {Redirect} = require('react-router-dom');

let cachedStates = [];

const Lights = React.createClass({
    getInitialState: function() {
        return {states: cachedStates};
    },
    componentWillMount: function() {
        lightsConduit.on({
            refresh: states => {
                cachedStates = states;
                this.setState({states: states});
            }
        });
        lightsConduit.emit('init');
    },
    componentWillUnmount: function() {
        lightsConduit.destroy();
    },
    render: function() {
        if (!Booker.lights.use) {
            return <Redirect to="/" />;
        }

        const groups = this.state.states.map((s, i) => {
            return <LightGroup {...s} key={i} />
        });
        return (
            <section className="panel">
                <div className="panel-title">
                    <h2>Lights</h2>
                    <SVG id="light-icon" />
                </div>
                <ul>
                    {groups}
                </ul>
            </section>
        );
    }
});

const LightGroup = React.createClass({
    getInitialState: function() {
        return {
            detailsExpanded: false
        };
    },
    toggle: function() {
        lightsConduit.emit('toggle', this.props.id);
    },
    toggleDetails: function() {
        this.setState({
            detailsExpanded: !this.state.detailsExpanded
        });
    },
    render: function() {
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
});

var BrightnessSlider = React.createClass({
    getInitialState: function() {
        return {
            //if the user is currently dragging the slider
            adjusting: false,
            //timeout for emitting updates to the server so we don't send updates for every change event (every tick sometimes)
            updateTimeout: null
        };
    },
    changeBrightness: function(e) {
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
    },
    startAdjust: function() {
        this.setState({adjusting: true});
    },
    stopAdjust: function() {
        this.setState({adjusting: false});
    },
    shouldComponentUpdate: function(nextProps) {
        //don't try to re-render and set brightness again until the user is done messing with it and we have an update
        //allows brightness to be updated (and synced) by other clients without jankily setting the value while they're dragging
        return (this.props.brightness !== nextProps.brightness) && !this.state.adjusting;
    },
    componentDidUpdate: function() {
        this.slider.value = this.props.brightness;
    },
    render: function() {
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
});

module.exports = Lights;