var React = require('react');

var List = React.createClass({
    render: function() {
        var groups = this.props.states.map(s => {
            return <LightGroup id={s.id} name={s.name} on={s.on} socket={this.props.socket}/>
        });
        return (
            <ul>
                {groups}
            </ul>
        );
    }
});

var LightGroup = React.createClass({
    toggle: function() {
        this.props.socket.emit('toggle', this.props.id);
    },
    render: function() {
        var check = this.props.on ? '☑' : '☐';
        return (
            <button onClick={this.toggle}>{check} {this.props.name}</button>
        )
    }
});

module.exports = {
    List, LightGroup
};