const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const repo = require('../persistence/repository/article');
const conn = require('../persistence/connection');

describe('Article repository', function() {
    var articleId;

    beforeEach(function(done) {
        conn.query('DELETE FROM Article')
            .then(success => repo.put({title: 'Title1', body: 'Body1', created: new Date(), updated: new Date()}))
            .then(success => repo.put({title: 'Title2', body: 'Body2', created: new Date(), updated: new Date()}))
            .then(success => {
                articleId = success.insertId;
                done();
            })
            .catch(error => done(error));
    });

    describe('#get', function() {
        it('returns result', function() {
            return expect(repo.get(articleId)).to.eventually.have.length(1);
        });
    });

    describe('#getAll', function() {
        it('returns results', function() {
            return expect(repo.getAll()).to.eventually.have.length(2);
        });
    });

    describe('#put', function() {
        it('returns results', function() {
            return expect(repo.put({title: 'Title', body: 'Body', created: new Date(), updated: new Date()})).to.eventually.be.ok;
        });
    });
});