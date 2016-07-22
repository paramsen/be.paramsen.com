const root = '../../../';

const chai = require('chai');
const expect = chai.expect;
chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));

const repo = require(root + 'persistence/repository/article');
const conn = require(root + 'persistence/connection');

describe('Article repository', function() {
    var articleId;

    beforeEach(function(done) {
        conn.query('DELETE FROM Article')
            .then(success => repo.put({title: 'Title1', body: 'Body1', excerpt: 'Excerpt1', created: new Date(), updated: new Date()}))
            .then(success => repo.put({title: 'Title2', body: 'Body2', excerpt: 'Excerpt2', created: new Date(), updated: new Date()}))
            .then(success => repo.put({title: 'Title3', body: 'Body3', excerpt: 'Excerpt3', created: new Date(), updated: new Date()}))
            .then(success => repo.put({title: 'Title4', body: 'Body4', excerpt: 'Excerpt4', created: new Date(), updated: new Date()}))
            .then(success => repo.put({title: 'Title5', body: 'Body5', excerpt: 'Excerpt5', created: new Date(), updated: new Date()}))
            .then(success => {
                articleId = success;
                done();
            })
            .catch(error => done(error));
    });

    describe('#get', function() {
        it('returns result', function() {
            return expect(repo.get(articleId)).to.eventually.include.a.thing.with.property('title', 'Title5');
        });
    });

    describe('#getPage', function() {
        it('returns result', function() {
            return expect(repo.getPage(1, 2)).to.eventually.include.a.thing.with.property('title', 'Title3');
        });
    });

    describe('#getAll', function() {
        it('returns results', function() {
            return expect(repo.getAll()).to.eventually.have.length(5);
        });
    });

    describe('#getAll: Check hash', function() {
        it('returns results', function() {
            return expect(repo.getAll()).to.eventually.include.something.that.deep.contain.any.keys('id');
        });
    });

    describe('#getAll: Check hash negation', function() {
        it('returns results', function() {
            return expect(repo.getAll()).to.eventually.include.something.that.not.deep.contain.any.keys('ids');
        });
    });

    describe('#put', function() {
        it('puts row', function() {
            return expect(repo.put({title: 'Title', body: 'Body', excerpt: 'Excerpt', created: new Date(), updated: new Date()})).to.eventually.be.ok;
        });
    });

    describe('#put: Title constraint', function() {
        it('puts row', function() {
            return expect(repo.put({title: 'TitleTitleTitleTitleTitleTitleTitleTitleTitleTitleTitleTitleTitle', body: 'Body', excerpt: 'Excerpt', created: new Date(), updated: new Date()})).to.eventually.be.nok;
        });
    });

    describe('#put -> #get', function() {
        it('puts row and gets it', function() {
            return expect(repo.put({title: 'Title', body: 'Body', excerpt: 'Excerpt', created: new Date(), updated: new Date()})
                    .then(success => repo.get(success)))
                    .to.eventually.have.length(1);
        });
    });

    describe('#update -> #get', function() {
        it('updates existing row and gets it', function() {
            return expect(repo.update({title: 'Updated', body: 'Updated', excerpt: 'Updated', updated: new Date(), id: articleId})
                    .then(success => repo.get(success)))
                    .to.eventually.include.a.thing.with.property('title', 'Updated');
        });
    });
});