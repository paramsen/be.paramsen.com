const conn = require('../connection');

module.exports.put = article => {
    return conn.put('INSERT INTO Article (title, body, created, updated) VALUES (?, ?, ?, ?)', [article.title, article.body, article.created, article.updated]);
}

module.exports.get = id => {
    return conn.query('SELECT * FROM Article WHERE id = ?',  [id]);
}

module.exports.getAll = () => {
    return conn.query('SELECT * FROM Article');
}
