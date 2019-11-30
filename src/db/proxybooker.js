const Booker = require('./booker'),
    proxies = require('../../config.json').proxies || [];

//'view' is the list of proxies, then there are the proxies themselves
const proxyBooker = new Booker('proxy', ['view', ...proxies.map(p => p.name)]);

module.exports = proxyBooker;
