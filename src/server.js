const dep = require('./base/dependency'),
    express = require('express'),
    expressConf = require('./base/express-conf'),
    authConf = require('./base/auth-conf'),
    sessionConf = require('./base/session-conf'),
    app = expressConf.app,
    log = dep.log,
    ENVIRONMENT = dep.ENVIRONMENT;

Promise.resolve()
    .then(setupBase())
    .then(expressConf.init())
    .then(sessionConf.init())
    .then(authConf.init())
    .then(setupRoutes())
    .then(startServer());

function setupRoutes() {    
    app.use('/api/auth', require('./api/auth').api);
    app.use('/api/article', require('./api/article').api);
    app.use(errorHandler);
}

function startServer() {
    app.listen(dep.PORT);
    log.info('Express started [port: ' + dep.PORT + ']');
}

function setupBase() {
    if (ENVIRONMENT !== 'development' && ENVIRONMENT !== 'test' && ENVIRONMENT !== 'production') {
        throw 'Set env var NODE_ENV to either \"development\", \"test\" or \"production\" in host (host == container if dockerized)'
    } else {
        log.info('NODE_ENV: ' + ENVIRONMENT);
    }
}

function errorHandler(err, req, res, next)  {
    if(err instanceof Error) {
        log.error(err.stack);
    } else {
        log.error(err);
    }

   res.status(400).json({message: 'fail'});
}
