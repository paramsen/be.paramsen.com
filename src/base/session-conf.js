const db = require('../persistence/connection'),
    dep = require('./dependency'),
    express = require('express'),
    app = require('./express-conf').app,
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
    ENVIRONMENT = dep.ENVIRONMENT;

module.exports.init = () => {
    return new Promise((resolve, reject) => {
        if(ENVIRONMENT === 'production')
            app.set('trust proxy', 1);

        app.use(session);

        resolve();
    });
};