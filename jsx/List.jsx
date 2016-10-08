var React = require('react');

var List = React.createClass({
    render: function() {
        var groups = this.props.states.map((s, i) => {
            return <LightGroup id={s.id} name={s.name} on={s.on} socket={this.props.socket} brightness={s.brightness} key={i}/>
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
    changeBrightness: function(e) {
        //don't want to try to adjust the brightness on every increment
        if (!this.state.updateTimeout) {
            e.persist();
            this.setState({
                updateTimeout: setTimeout(() => {
                    this.props.socket.emit('brightness', this.props.id, e.target.value);
                    
                    //allow later updates
                    this.setState({updateTimeout: null});
                }, 500)
            });
        }
    },
    render: function() {
        var check = this.props.on ? '☑' : '☐',
            slideId = 'lg-slide-' + this.props.id,
            toggleClass = 'lg-toggle ' + (this.props.on ? 'on' : 'off'),
            detailsClass = 'lg-details' + (this.state.detailsExpanded ? ' expanded' : '');
        
        return (
            <li>
                <div className="light-group">
                    <button className={toggleClass} onClick={this.toggle}>{check} {this.props.name}</button>
                    <button className="lg-details-toggle" onClick={this.toggleDetails}>⚙</button>
                    <div className={detailsClass}>
                        <label htmlFor={slideId}>Brightness</label>
                        <br/>
                        <input className="lg-brightness-slide" id={slideId} type="range" min="0" max="255" onChange={this.changeBrightness} defaultValue={this.props.brightness}/>
                    </div>
                    
                </div>
            </li>
        )
    }
});

module.exports = {
    List, LightGroup
};