const passport = require('passport'),
    app = require('./express-conf').app,
    Strategy = require('passport-local').Strategy,
    userRepo = require('../persistence/repository/user'),
    bcrypt = require('bcrypt'),
    log = require('./dependency').log;

module.exports.init = () => {
    //Setup auth strategy
    passport.use(new Strategy((username, password, done) => {
        userRepo.getByUsername(username)
            .then(user => {
                if(user) {
                    return user;
                }

                return Promise.reject('No user found for username: ' + username);
            })
            .then(user => validateHash(password, user.password).then(success => user))
            .then(success => {
                done(null, success);
            })
            .catch(error => {
                done(error, false);
            });
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((userId, done) => {
        userRepo.get(userId)
            .then(user => {
                done(null,  user.id);
            })
            .catch(error => {
                done(error, false);
            })
    });

    app.use(passport.initialize());
    app.use(passport.session());
}

function validateHash(password, hash) {
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, hash, (error, result) => {
            if(error || !result) {
                reject(new Error('wrong password'));
            } else {
                resolve(true);
            }
        });
    });
}