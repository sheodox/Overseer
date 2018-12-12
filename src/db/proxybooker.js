const Booker = require('./booker'),
    config = require('../config.json');

//'view' is the list of proxies, then there are the proxies themselves
const proxyBooker = new Booker('proxy', ['view', ...config.proxies.map(p => p.name)]);

module.exports = proxyBooker;
