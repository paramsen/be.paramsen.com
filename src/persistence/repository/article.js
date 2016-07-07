const conn = require('../connection');

module.exports.put = article => {
    return conn.put('INSERT INTO Article (title, body, created, updated) VALUES (?, ?, ?, ?)', [article.title, article.body, article.created, article.updated]);
}

module.exports.update = article => {
    return conn.put('UPDATE Article (title, body, updated) VALUES (?, ?, ?) WHERE id=?', [article.title, article.body, article.updated, article.id]);
}

module.exports.get = id => {
    return conn.query('SELECT * FROM Article WHERE id = ?',  [id]);
}

module.exports.getAll = () => {
    return conn.query('SELECT * FROM Article');
}
