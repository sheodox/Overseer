const React = require('react');

const UserBubble = React.createClass({
    render: function() {
        console.log(this.props.user);
        if (!this.props.user) {
            return null;
        }
        return <img className="user-bubble" src={this.props.user.profile_image} title={this.props.user.display_name} />
    }
});
module.exports = UserBubble;
