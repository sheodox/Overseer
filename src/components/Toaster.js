const React = require('react'),
    {Link} = require('react-router-dom'),
    SVG = require('./SVG'),
    Conduit = require('../util/conduit');

const notifyConduit = new Conduit(socket, 'notifications');

const STALE_TOAST_CULL_MS = 5000;
let toastGUID = 0;

class Toaster extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            messages: [],
            staleTimeouts: {}
        }
    }
    cullToast(id) {
        const messages = this.state.messages
            .slice();
        messages.splice(messages.findIndex(o => o.id === id), 1);

        this.setState({messages});
    }
    componentDidMount() {
        window.Toaster = {
            add: (props) => {
                const queueCull = () => {
                    //update timers so toasts with no changes for a set time will get removed
                    clearTimeout(this.state.staleTimeouts[id]);
                    this.state.staleTimeouts[id] = setTimeout(() => {
                        this.cullToast(id);
                    }, STALE_TOAST_CULL_MS);
                };
                const id = toastGUID++;
                props.id = id;
                const messages = this.state.messages.slice();
                messages.push(props);
                this.setState({messages});
                queueCull();
                return (newProps) => {
                    queueCull();

                    const messages = this.state.messages,
                        replacingProps = messages.find(p => p.id === id);

                    Object.assign(replacingProps, newProps);
                    this.setState({messages});
                }
            }
        };
        //server pushed notifications
        notifyConduit.on({
            notification: (args) => {
                window.Toaster.add(args);
            }})
    }
    render() {
        return (
            <div id="toaster">
                {this.state.messages.map((p, i) => <Toast key={i} {...p} />)}
            </div>
        );
    }
}

class Toast extends React.Component {
    getDetailDom() {
        switch (this.props.type) {
            case 'text':
                return (<p>{this.props.text}</p>);
            case 'progress':
                return (
                    <div>
                        <p>{this.props.text}</p>
                        <progress value={this.props.value} max={this.props.max} />
                    </div>);
            case 'link':
                return (
                    <Link to={this.props.href}>{this.props.text}</Link>
                );
        }
    }
    render() {
        return (
            <div className={'toast' + (this.props.error ? ' error' : '')}>
                <h1>{this.props.title}</h1>
                {this.getDetailDom()}
            </div>
        );
    }
}

module.exports = Toaster;
