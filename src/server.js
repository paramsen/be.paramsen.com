const dep = require('./base/dependency'),
    express = require('express'),
    expressConf = require('./base/express-conf'),
    authConf = require('./base/auth-conf'),
    sessionConf = require('./base/session-conf'),
    app = expressConf.app,
    router = express.Router(),
    auth = require('./api/auth'),
    log = dep.log,
    ENVIRONMENT = dep.ENVIRONMENT;

Promise.resolve()
    .then(setupBase())
    .then(expressConf.init())
    .then(sessionConf.init())
    .then(authConf.init())
    .then(setupRoutes())
    .then(startServer());

function setupRoutes() {    router.use('/api/article', require('./api/article').api);

    app.use(router);

    app.use((err, req, res, next) => {
        if(err instanceof Error) {
            log.error(err.stack);
        } else {
            log.error(err);
        }

        res.status(500).json({message: 'fail'});
    });
}

function startServer() {
    app.listen(PORT);
    log.info('Express started [port: ' + dep.PORT + ']');
}

function setupBase() {
    if (ENVIRONMENT !== 'development' && ENVIRONMENT !== 'test' && ENVIRONMENT !== 'production') {
        throw 'Set env var NODE_ENV to either \"development\", \"test\" or \"production\" in host (host == container if dockerized)'
    } else {
        log.info('NODE_ENV: ' + ENVIRONMENT);
    }
}
