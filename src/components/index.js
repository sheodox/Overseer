import '../scss/style.scss';
const ReactDOM = require('react-dom'),
    React = require('react'),
    App = require('./App'),
    Trancemaker = require('./Trancemaker');

new Trancemaker();
const reactMount = document.querySelector('#react-mount');

ReactDOM.render(
    <App />,
    reactMount
);
