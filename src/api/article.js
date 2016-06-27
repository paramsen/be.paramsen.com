const router = require('express').Router(),
    repo = require('../persistence/repository/article');

module.exports.api = router;

router.post('/', (req, res) => {
    res.json({message: 'success'});
});