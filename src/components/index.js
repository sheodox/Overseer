const ReactDOM = require('react-dom'),
    React = require('react'),
    App = require('./App'),
    Trancemaker = require('./Trancemaker');

new Trancemaker();
const reactMount = document.querySelector('#react-mount');
reactMount.addEventListener('click', e => {
    if (e.target === reactMount) {
        appBack(); //in App.js
    }
});

ReactDOM.render(
    <App />,
    reactMount
);
