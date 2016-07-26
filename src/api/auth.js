const router = require('express').Router(),
    passport = require('passport'),
    log = require('../base/dependency').log;

module.exports.passport = passport;

module.exports.api = router;

// Middleware that validates that users session is authenticated
module.exports.authenticate = (req, res, next) => {
    if(req.isAuthenticated()) {
        next();
    } else {
        res.status(401).json({ message: 'unauthorized' });
    }
};

// The authorization implementation is in auth-conf
router.post('/', passport.authenticate('local'), (req, res) => {
    res.json({ message: 'success' });
});