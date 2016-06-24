'use strict';

/**
 * @author Pär Amsen @ Nixon Nixon / 2016
 */
const dep = require('./dependency'),
    poll = require('./poll-push'),
    redis = require('./redis-db'),
    log = dep.log,
    ENVIRONMENT = dep.ENVIRONMENT;

setup();

redis.ready()
    .then(poll)
    .catch(error => log.error('Error starting: ', error));

function setup() {
    if (ENVIRONMENT !== 'development' && ENVIRONMENT !== 'production') {
        throw 'Set env var NODE_ENV to either \"development\" or \"production\" in host (host == container if dockerized)'
    } else {
        log.info('NODE_ENV: ' + ENVIRONMENT);
    }

    String.prototype.trunc = String.prototype.trunc ||
        function(n) {
            return (this.length > n) ? this.substr(0, n - 1) + '..' : this;
    };
}