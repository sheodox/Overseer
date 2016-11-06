import React from 'react';
import SVG from './SVG';
import {connect} from 'react-redux';
import actions from '../actions/act-lights-client';

var Lights = React.createClass({
    render: function() {
        var groups = this.props.states.map((s, i) => {
            return <LightGroup {...s} key={i} changeBrightness={this.props.brightness} toggleGroup={this.props.toggle}/>
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

var LightGroup = React.createClass({
    getInitialState: function() {
        return {
            detailsExpanded: false
        };
    },
    toggle: function() {
        this.props.toggleGroup(this.props.id);
    },
    toggleDetails: function() {
        this.setState({
            detailsExpanded: !this.state.detailsExpanded
        });
    },
    render: function() {
        var check = this.props.on ? '☑' : '☐',
            toggleClass = 'lg-toggle ' + (this.props.on ? 'on' : 'off'),
            detailsClass = 'lg-details' + (this.state.detailsExpanded ? ' expanded' : '');

        return (
            <li className="sub-panel">
                <div className="light-group">
                    <button className={toggleClass} onClick={this.toggle}>{check} {this.props.name}</button>
                    <button className="lg-details-toggle" onClick={this.toggleDetails}>⚙</button>
                    <div className={detailsClass}>
                        <BrightnessSlider {...this.props} changeBrightness={this.props.changeBrightness} />
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
                    this.props.changeBrightness(this.props.id, e.target.value);

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

function mapStateToProps(state) {
    return {
        states: state.lights
    }
}

function mapDispatchToProps(dispatch) {
    socket.on('lights/refresh', states => {
        dispatch(actions.refresh(states));
    });

    return {
        toggle: (id) => {
            dispatch(actions.toggle(id));
        },
        brightness: (id, brightness) => {
            dispatch(actions.brightness(id, brightness));
        }
    }
}

module.exports = connect(
    mapStateToProps,
    mapDispatchToProps
)(Lights);