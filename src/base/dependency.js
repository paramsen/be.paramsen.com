const Log = require('log');

const log = new Log('info');

module.exports.log = log;
module.exports.ENVIRONMENT = process.env.NODE_ENV;
module.exports.SESSION_SECRET = process.env.SESSION_SECRET;
module.exports.PORT = 8080;

