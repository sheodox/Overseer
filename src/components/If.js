const React = require('react');

class If extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        if (!this.props.renderWhen) {
            return null;
        }
        return this.props.children;
    }

}

module.exports = If;
