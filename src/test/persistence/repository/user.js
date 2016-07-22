const root = '../../../';

const chai = require('chai');
const expect = chai.expect;

chai.should();
chai.use(require('chai-things'));
chai.use(require('chai-as-promised'));

const bcrypt = require('bcrypt');
const repo = require(root + 'persistence/repository/user');
const conn = require(root + 'persistence/connection');

describe('User repository', function() {
    var userId;

    beforeEach(function(done) {
        conn.query('DELETE FROM User')
            .then(success => repo.put({username: 'username', password: 'password'}))
            .then(success => {
                userId = success;
                done();
            })
            .catch(error => done(error));
    });

    describe('#get', function() {
        it('returns result', function() {
            return expect(repo.get(userId)).to.eventually.have.property('username', 'username');
        });
    });

    describe('#put', function() {
        it('puts row', function() {
            return expect(repo.put({username: 'cool', password: 'bajs'})).to.eventually.be.ok;
        });
    });

    describe('#put: Username constraint', function() {
        it('puts row', function() {
            return expect(repo.put({username: 'usernameusernameusername', password: 'cool'})).to.eventually.be.nok;
        });
    });

    describe('#put -> #get', function() {
        it('puts row and gets it', function() {
            return expect(repo.put({username: 'zlatan', password: 'qwerty'})
                    .then(success => repo.get(success)))
                    .to.eventually.have.property('username', 'zlatan');
        });
    });

    describe('#put -> #get -> validate hash', function() {
        it('puts row and gets it', function() {
            return expect(repo.put({username: 'zlatan', password: 'qwerty'})
                    .then(success => repo.get(success))
                    .then(user => new Promise((resolve, reject) => {
                        bcrypt.compare('qwerty', user.password, (error, result) => {
                            if(error || !result) {
                                reject(error);
                            } else {
                                resolve(result);
                            }
                        });
                    })))
                    .to.eventually.be.ok;
        });
    });
});