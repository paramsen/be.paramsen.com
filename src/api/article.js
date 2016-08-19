const router = require('express').Router(),
    auth = require('./auth'),
    repo = require('../persistence/repository/article'),
    log = require('../base/dependency').log;

module.exports.api = router;

router.post('/create', auth.authenticate, (req, res, next) => {
    req.body.article.created = new Date();
    req.body.article.updated = new Date();

    repo.put(req.body.article)
        .then(success => {
            res.json({message: 'success'});
        })
        .catch(error => {
            next(error);
        });
});

router.post('/update', auth.authenticate, (req, res, next) => {
    req.body.article.updated = new Date();

    repo.update(req.body.article)
        .then(success => {
            res.json({message: 'success'});
        })
        .catch(error => {
            next(error);
        });
});

router.get('/', (req, res, next) => {
    repo.getPage(parseInt(req.query.index) || 0, parseInt(req.query.count) || 10)
        .then(success => {
            res.json({article: success});
        })
        .catch(error => {
            next(error);
        });
});

router.get('/:key', (req, res, next) => {
    if(req.query.type === 'id') {
        repo.get(req.params.key)
        .then(success => {
            res.json({article: success});
        })
        .catch(error => {
            next(error);
        });    
    } else if(req.query.type === 'name') {
        repo.getByName(req.params.key)
        .then(success => {
            res.json({article: success});
        })
        .catch(error => {
            next(error);
        });
    } else {
        next(new Error('No type chosen'));
    }
});
