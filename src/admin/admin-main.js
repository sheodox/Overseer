const React = require('react'),
    ReactDOM = require('react-dom'),
    Conduit = require('../util/conduit');
const socket = io(),
    adminConduit = new Conduit(socket, 'admin');

const Admin = React.createClass({
    getInitialState: function() {
        return {}
    },
    componentDidMount: function() {
        adminConduit.emit('init');
        adminConduit.on({
            refresh: data => {
                console.log(data);
                this.setState(data);
            }
        });
    },
    render: function() {
        const bookers = [];
        for (let bookerModule in this.state) {
            if (this.state.hasOwnProperty(bookerModule)) {
                bookers.push(
                    <BookerConfig key={bookerModule} module={bookerModule} {...this.state[bookerModule]} />
                );
            }
        }
        return (
            <div>{bookers}</div>
        );
    }
});

const BookerConfig = React.createClass({
    newRole: function(e) {
        const roleName = e.target.value;
        if (roleName && e.which === 13) {
            adminConduit.emit('new-role', this.props.module, roleName);
            e.target.value = '';
        }
    },
    render: function() {
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
            assignments = this.props.users.map((userData, index) => {
                const assignment = this.props.assignments.find(assignment => {
                    return assignment.user_id === userData.user_id;
                });
                return <RoleAssignments assignment={assignment} module={this.props.module} {...userData} roles={this.props.roles} key={index}/>
            });
        }

        return (
            <div>
                <h1>Booker - {this.props.module}</h1>
                <h2>Roles</h2>
                <label>New role:
                    <input onKeyDown={this.newRole} />
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
                <h2>Assignments</h2>
                <table>
                    <thead>
                        <tr><th>User</th><th>Role</th></tr>
                    </thead>
                    <tbody>
                        {assignments}
                    </tbody>
                </table>
                <hr />
            </div>
        )
    }
});

const RoleAssignments = React.createClass({
    componentDidMount: function() {
        if (this.props.assignment) {
            this.roleSelect.value = this.props.assignment.role_id;
        }
    },
    assignRole: function(e) {
        const newRole = this.roleSelect.value;
        adminConduit.emit('assign-role', this.props.module, this.props.user_id, newRole);
    },
    render: function() {
        const options = [{name: '', role_id: ''}, ...this.props.roles].map((role, i) => {
            return <option key={i} value={role.role_id}>{role.name}</option>;
        });
        return (
            <tr>
                <td><img src={this.props.profile_image} style={{width: '20px', height: '20px'}}/>{this.props.display_name}</td>
                <td><select ref={c=>this.roleSelect=c} onChange={this.assignRole}>{options}</select></td>
            </tr>
        );
    }
});

const RoleActions = React.createClass({
    toggleAction: function(e) {
        const action = e.target.getAttribute('data-action');
        console.log(`toggle ${action}`);
        adminConduit.emit('toggle-action', this.props.module, this.props.roleData.role_id, action);
    },
    render: function() {
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
});

ReactDOM.render(
    <Admin />,
    document.querySelector('#react-mount')
);
