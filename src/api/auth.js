const router = require('express').Router(),
    passport = require('passport'),
    Strategy = require('passport-local').Strategy,
    log = require('../base/dependency').log;

module.exports.passport = passport;
module.exports.api = router;
module.exports.authenticate = (req, res, next) => {
    if(req.isAuthenticated()) {
        next();
    } else {
        res.status(402).json({ message: 'unauthorized' });
    }
};

passport.use(new Strategy((user, pw, done) => {
    done(null, 'pär'); //validate credentials

    //done(err); for err, done(null, false) for no such user if viable
}));

passport.serializeUser((user, done) => {
    done(null, user.id); //save to session
});

passport.deserializeUser((user, done) => {
    done(null, 'pär'); //get from session
});

router.post('/', passport.authenticate('local', (req, res) => {
    res.json({ message: 'success' });
});