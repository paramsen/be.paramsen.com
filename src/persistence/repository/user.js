const conn = require('../connection'),    
    bcrypt = require('bcrypt'),
    log = require('../../base/dependency').log;

module.exports.put = user => {
    return hash(user.password)
        .then(hash => {
            return conn.put('INSERT INTO User (username, password) VALUES (?, ?)', [user.username, hash]);
        })
        .then(success => {
            return success.insertId;
        });
}

module.exports.get = id => {
    return conn.query('SELECT * FROM User WHERE id = ?',  [id]).then(first);
}

module.exports.getByUsername= username => {
    return conn.query('SELECT * FROM User WHERE username = ?',  [username]).then(first);
}

function hash(password) {
    return new Promise((resolve, reject) => {
        bcrypt.hash(password, 10,  (error, hash) => {
            if(error) {
                reject(error);
            } else {
                resolve(hash);
            }
        });
    });
}

function first(users) {
    return users[0];
}