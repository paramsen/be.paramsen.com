const Log = require('log');

const log = new Log('info');

module.exports.log = log;
module.exports.ENVIRONMENT = process.env.NODE_ENV;
