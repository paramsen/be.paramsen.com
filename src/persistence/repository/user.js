const conn = require('../connection'),
    log = require('../../base/dependency').log;

module.exports.put = user => {
    return conn.put('INSERT INTO User (username, password) VALUES (?, ?)', [user.username, user.password]).then(success => {
        return success.insertId;
    });
}

module.exports.update = user => {
    return conn.put('UPDATE User SET username = ?, password = ?', [user.username, user.password]).then(success => {
        return user.id;
    });
}

module.exports.get = id => {
    return conn.query('SELECT * FROM User WHERE id = ?',  [id]);
}

module.exports.getByUsername= username => {
    return conn.query('SELECT * FROM User WHERE username = ?',  [username]);
}

