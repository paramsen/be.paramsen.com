const router = require('express').Router(),
    repo = require('../persistence/repository/article'),
    log = require('../base/dependency').log;

module.exports.api = router;

router.post('/create', (req, res) => {
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

router.post('/update', (req, res) => {
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
    repo.getAll()
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