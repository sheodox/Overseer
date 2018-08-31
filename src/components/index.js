const ReactDOM = require('react-dom'),
    React = require('react'),
    App = require('./App'),
    Trancemaker = require('./Trancemaker');

new Trancemaker();

ReactDOM.render(
    <App />,
    document.querySelector('#react-mount')
);
