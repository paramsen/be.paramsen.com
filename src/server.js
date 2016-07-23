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
    auth = require('./api/auth'),
    db = require('./persistence/connection'),
    rawSession = require('express-session'),
    session = rawSession({secret: dep.SESSION_SECRET, resave: false, saveUninitialized: false, cookie: { secure: dep.ENVIRONMENT === 'production', maxAge: 3600000 }}),
    MySQLStore = require('express-mysql-session')(rawSession),
    sessionStore = new MySQLStore({
        checkExpirationInterval: 900000, //15 min
        expiration: 3600000, //60 min
        createDatabaseTable: true,
        schema: {
            tableName: 'Session',
            columnNames: {
                session_id: 'session_id',
                expires: 'expires',
                data: 'data'
            }
        }

    }, db.pool),
    log = dep.log,
    ENVIRONMENT = dep.ENVIRONMENT;

function setupServer() {
    if(ENVIRONMENT === 'production')
        app.set('trust proxy', 1);

    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json());
    app.use(session);
    app.use(auth.passport.initialize());
    app.use(auth.passport.session());

    router.use('/api/auth', auth.api);
    router.use('/api/article', require('./api/article').api);

    app.use(router);
    app.use((err, req, res, next) => {
        if(err instanceof Error) {
            log.error(err.stack);
        } else {
            log.error(err);
        }

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

setupBase();
setupServer();