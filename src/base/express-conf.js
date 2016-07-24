const express = require('express'),
    app = express(),
    bodyParser = require('body-parser');

module.exports.app = app;

module.exports.init = () => {
    return new Promise((resolve, reject) => {
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());

        resolve();
    });
}