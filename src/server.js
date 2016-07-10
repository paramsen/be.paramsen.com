'use strict';

/**
 * Entry, starts Express inits base
 *
 * @author Pär Amsen / par.nils.amsen@gmail.com / 2016
 */
const PORT = 8080;

const dep = require('./base/dependency'),
    express = require('express'),
    app = express(),
    router = express.Router(),
    bodyParser = require('body-parser'),
    log = dep.log,
    ENVIRONMENT = dep.ENVIRONMENT;

setupBase();
setupServer();

function setupServer() {
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    app.use(bodyParser.json());

    router.use('/api/article', require('./api/article').api);

    app.use(router);
    app.use((err, req, res, next) => {
        log.error(err.stack);
        res.status(500).json({message: 'fail'});
    });

    app.listen(PORT);

    log.info('Express started [port: ' + PORT + ']');
}

function setupBase() {
    if (ENVIRONMENT !== 'development' && ENVIRONMENT !== 'test' && ENVIRONMENT !== 'production') {
        throw 'Set env var NODE_ENV to either \"development\", \"test\" or \"production\" in host (host == container if dockerized)'
    } else {
        log.info('NODE_ENV: ' + ENVIRONMENT);
    }
}