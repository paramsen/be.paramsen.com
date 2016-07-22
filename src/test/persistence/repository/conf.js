const root = '../../../';

const chai = require('chai');
const conn = require(root + 'persistence/connection');

// After all tests in all files are run
after(function(done) {
    conn.pool.end(error => {
        if(error) return done(error);
        done();
    });
});