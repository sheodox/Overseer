var React = require('react');

var List = React.createClass({
    render: function() {
        var groups = this.props.states.map((s, i) => {
            return <LightGroup {...s} socket={this.props.socket} key={i}/>
        });
        return (
            <ul>
                {groups}
            </ul>
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
        this.props.socket.emit('toggle', this.props.id);
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
            <li>
                <div className="light-group">
                    <button className={toggleClass} onClick={this.toggle}>{check} {this.props.name}</button>
                    <button className="lg-details-toggle" onClick={this.toggleDetails}>⚙</button>
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
            adjusting: false,
            updateTimeout: null,
            //signifies we have changes in the dom we haven't received back from props (brightness has been changed but the server isn't broadcasting it yet)
            hotChanges: false
        };
    },
    changeBrightness: function(e) {
        //don't want to try to adjust the brightness on every increment
        if (!this.state.updateTimeout) {
            e.persist();
            this.setState({
                hotChanges: true,
                updateTimeout: setTimeout(() => {
                    this.props.socket.emit('brightness', this.props.id, e.target.value);

                    //allow later updates
                    this.setState({updateTimeout: null});
                }, 500)
            });
        }
    },
    componentWillReceiveProps: function() {
        //we got a new state from the server, don't need to prevent setting the input value
        this.setState({
            hotChanges: false
        });
    },
    startAdjust: function() {
        this.setState({adjusting: true});
    },
    stopAdjust: function() {
        this.setState({adjusting: false});
    },
    componentDidUpdate: function() {
        //wait until we have a proper update from the server (not dragging the input and we have new props) so we don't get janky movement
        if (!this.state.hotChanges && !this.state.adjusting) {
            console.log(`wasn't adjusting`);
            this.slider.value = this.props.brightness;
        }
        else {
            console.log('was adjusting');
        }
    },
    render: function() {
        var inputAttrs = {
                type: 'range',
                min: '0',
                max: '254',
                id: 'lg-slide-' + this.props.id,
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
                <input className="lg-brightness-slide" ref={c => this.slider = c} {...inputAttrs} {...events} />
            </div>
        )
    }
});

module.exports = List;