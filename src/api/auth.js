const router = require('express').Router(),
    passport = require('passport'),
    Strategy = require('passport-local').Strategy,
    userRepo = require('../persistence/repository/user'),
    bcrypt = require('bcrypt'),
    log = require('../base/dependency').log;

module.exports.passport = passport;
module.exports.api = router;
module.exports.authenticate = (req, res, next) => {
    if(req.isAuthenticated()) {
        next();
    } else {
        res.status(500).json({ message: 'unauthorized' });
    }
};

passport.use(new Strategy((username, password, done) => {
    userRepo.getByUsername(username)
        .then(user => {
            if(user) {
                return user;
            }

            return Promise.reject('No user found for username: ' + username);
        })
        .then(user => validateHash(password, user.password))
        .then(success => {
            done(null, success); //validate credentials
        })
        .catch(error => {
            done(error, false);
        });
    //done(err); for err, done(null, false) for no such user if viable
}));

passport.serializeUser((user, done) => {
                            console.log('serialize');

    done(null, user.id); //save to session
});

passport.deserializeUser((user, done) => {
                            console.log('deserialize');

    done(null,  user.username); //get from session
});

router.post('/', passport.authenticate('local'), (req, res) => {
    res.json({ message: 'success' });
});

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