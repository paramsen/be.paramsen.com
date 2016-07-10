const router = require('express').Router(),
    auth = require('./auth'),
    repo = require('../persistence/repository/article'),
    log = require('../base/dependency').log;

module.exports.api = router;

router.post('/create', auth, (req, res) => {
    req.body.article.created = new Date();
    req.body.article.updated = new Date();

    repo.put(req.body.article)
        .then(success => {
            res.json({message: 'success'});
        })
        .catch(error => {
            res.status(404).json({message: 'fail'});
        });
});

router.post('/update', auth, (req, res) => {
    req.body.article.updated = new Date();

    repo.update(req.body.article)
        .then(success => {
            res.json({message: 'success'});
        })
        .catch(error => {
            res.status(404).json({message: 'fail'});
        });
});

router.get('/', (req, res) => {
    repo.getPage(parseInt(req.query.from) || 0, parseInt(req.query.count) || 10)
        .then(success => {
            res.json({article: success});
        })
        .catch(error => {
            res.status(404).json({message: 'fail'});
        });
});

router.get('/:id', (req, res) => {
    repo.get(req.params.id)
        .then(success => {
            res.json({article: success});
        })
        .catch(error => {
            res.status(404).json({message: 'fail'});
        });
});
