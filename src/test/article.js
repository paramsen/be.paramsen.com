const chai = require('chai');
const expect = chai.expect;
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

const repo = require('../persistence/repository/article');

describe('Article repository', function() {
    describe('#get', function() {
        it('returns result', function() {
            return expect(repo.get('1')).to.eventually.have.length(1);
        });
    });

    describe('#getAll', function() {
        it('returns results', function() {
            return expect(repo.getAll()).to.eventually.have.length(2);
        });
    });

    describe('#put', function() {
        it('returns results', function() {
            return expect(repo.put({title: 'Title', body: 'Body'})).to.eventually.be.ok;
        });
    });
});