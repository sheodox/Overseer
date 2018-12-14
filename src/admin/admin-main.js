const React = require('react'),
    ReactDOM = require('react-dom'),
    Conduit = require('../util/conduit');
const socket = io(),
    adminConduit = new Conduit(socket, 'admin');

class Admin extends React.Component {
    constructor(props) {
        super(props);
        this.state = {bookers: {}, users: []}
    }
    componentDidMount() {
        adminConduit.emit('init');
        adminConduit.on({
            refresh: data => {
                console.log(data);
                this.setState(data);
            }
        });
    }
    render() {
        const bookers = [];
        for (let bookerModule in this.state.bookers) {
            if (this.state.bookers.hasOwnProperty(bookerModule)) {
                bookers.push(
                    <BookerConfig key={bookerModule} module={bookerModule} {...this.state.bookers[bookerModule]} />
                );
            }
        }
        return (
            <div>
                <AssignmentTable bookers={this.state.bookers} users={this.state.users} />
                {bookers}
            </div>
        );
    }
}
        
class AssignmentTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    changeRole(userId, booker, role) {
        adminConduit.emit('assign-role', booker, userId, role)
    }
    render() {
        const bookerNames = Object.keys(this.props.bookers);
        console.log(bookerNames);
        
        const getAssignedRole = (user, bookerName) => {
            const booker = this.props.bookers[bookerName],
                roleId = booker.assignments.find(a => a.user_id === user).role_id;
            return <td>
                    <select value={roleId} onChange={e => this.changeRole(user, bookerName, e.target.value)}>
                        {booker.roles.map(r => <option value={r.role_id}>{r.name}</option>)};
                    </select>
                </td>;
        };
        
        const headers = ['User', ...bookerNames].map(text => <th>{text}</th>),
            rows = this.props.users.map(user => {
                //user's name and profile picture, then the assignments
                const assignments = bookerNames.map(booker => getAssignedRole(user.user_id, booker));
                return <tr key={user.user_id}>
                        <td>
                            <img alt='profile picture' src={user.profile_image} style={{width: '20px', height: '20px'}}/>
                            {user.display_name}
                        </td>
                        {assignments}
                    </tr>;
            });

        return (
        <section>
            <h1>Assignments</h1>
            <table>
                <thead>
                <tr>{headers}</tr>
                </thead>
                <tbody>
                {rows}
                </tbody>
            </table>
        </section>);
    }
}

class BookerConfig extends React.Component {
    newRole = (e) => {
        const roleName = e.target.value;
        if (roleName && e.which === 13) {
            adminConduit.emit('new-role', this.props.module, roleName);
            e.target.value = '';
        }
    };
    render() {
        let headers = [],
            rows = [],
            assignments = [];
        if (this.props.roles.length) {
            const actions = ['name', ...Object.keys(this.props.roles[0].permissions)];
            headers = actions.map((action, index) => {
                return (<th key={index}>{action}</th>)
            });
            rows = this.props.roles.map((roleData, index) => {
                return <RoleActions key={index} module={this.props.module} actions={actions} roleData={roleData}/>;
            });
        }

        return (
            <section className="booker">
                <h1>Booker - {this.props.module}</h1>
                <h2>Roles</h2>
                <label>New role:
                    <input type="text" onKeyDown={this.newRole} />
                </label>
                <table>
                    <thead>
                        <tr>
                            {headers}
                        </tr>
                    </thead>
                    <tbody>
                        {rows}
                    </tbody>
                </table>
            </section>
        )
    }
}


class RoleActions extends React.Component {
    toggleAction = (e) => {
        const action = e.target.getAttribute('data-action');
        console.log(`toggle ${action}`);
        adminConduit.emit('toggle-action', this.props.module, this.props.roleData.role_id, action);
    };
    render() {
        const cells = this.props.actions.map((action, index) => {
            //name is text, all others are booleans
            if (action === 'name') {
                return <td key={index}>{this.props.roleData.name}</td>
            }
            return <td key={index}>
                <input type="checkbox" data-action={action} checked={!!this.props.roleData.permissions[action]} onChange={this.toggleAction}/>
            </td>
        });
        return (
            <tr>
                {cells}
            </tr>)
    }
}

ReactDOM.render(
    <Admin />,
    document.querySelector('#react-mount')
);
