'use strict';

/**
 * @author Pär Amsen / par.nils.amsen@gmail.com / 2016
 */
const PORT = 8080;

const dep = require('./dependency'),
    app = (require('express'))(),
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

    app.get('/', (req, res) => {
        res.json({
            message: 'success'
        });
    });

    app.listen(PORT);

    log.info('Express started [port: ' + PORT + ']');
}

function setupBase() {
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