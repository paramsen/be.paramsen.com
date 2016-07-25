const router = require('express').Router(),
    passport = require('passport'),
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

router.post('/', passport.authenticate('local'), (req, res) => {
    res.json({ message: 'success' });
});