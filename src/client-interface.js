'use strict';

//=========================================================
//====== No use for this if we push only to FCM topics
//=========================================================

const PORT = 8080;
const REDIS_HOST = 'redis';
const REDIS_PORT = 6379;

const express = require('express'),
    bodyParser = require('body-parser'),
    Log = require('log');

const log = new Log('info');
const redis = Redis.createClient(REDIS_PORT, REDIS_HOST);
const app = express();

module.exports = () => {
    return new Promise((resolve, reject) => {
        app.listen(PORT);
        log.info('Express started [port: ' + PORT + ']');

        resolve();
    });
};

redis.on('connect', function() {
    log.info('Redis connected [port: ' + REDIS_PORT + ']');
});

app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(bodyParser.json());

const validators = express.Router();
const api = express.Router();

validators.post('/api', (req, res, next) => {
    if (req.body.uuid && req.body.token) {
        return next();
    }

    log.warning('POST /api > Error in request with body %s', JSON.stringify(req.body));
    nok(res);
});

validators.delete('/api', (req, res, next) => {
    if (req.body.uuid) {
        return next();
    }

    log.warning('POST /api > Error in request with body %s', JSON.stringify(req.body));
    nok(res);
});

api.post('/api', (req, res) => {
    onRegisterClient(req.body.uuid, req.body.token)
        .then(success => {
            log.info('POST /api > Client registered [uuid:%s, token:%s]', req.body.uuid, req.body.token);
            ok(res);
        })
        .catch(error => {
            log.warning('POST /api > Failed to register client [uuid:%s, token:%s]', req.body.uuid, req.body.token);
            nok(res);
        });
});

api.delete('/api', (req, res) => {
    onUnRegisterClient(req.body.uuid)
        .then(success => {
            log.info('DELETE /api > Client unregistered [uuid:%s]', req.body.uuid);
            ok(res);
        })
        .catch(error => {
            log.warning('DELETE /api > Failed to unregister client [uuid:%s]', req.body.uuid);
            nok(res);
        });
});

app.use(validators, api);

function onRegisterClient(uuid, token) {
    return new Promise((resolve, reject) => {
        redis.set('user:'uuid, token, (error, success) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

function onUnRegisterClient(uuid) {
    return new Promise((resolve, reject) => {
        redis.del('user:'uuid, (error, success) => {
            if (error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

function ok(res) {
    res.status(200).json({
        message: 'success'
    });
}

function nok(res) {
    res.status(400).json({
        message: 'fail'
    });
}
