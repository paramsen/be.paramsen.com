const conn = require('../connection'),
    log = require('../../base/dependency').log;

module.exports.put = article => {
    return conn.put('INSERT INTO Article (title, body, excerpt, created, updated) VALUES (?, ?, ?, ?, ?)', [article.title, article.body, article.excerpt, article.created, article.updated]).then(success => {
        return success.insertId;
    });
}

module.exports.update = article => {
    return conn.put('UPDATE Article SET title = ?, body = ?, excerpt = ?, updated = ? WHERE id = ?', [article.title, article.body, article.excerpt, article.updated, article.id]).then(success => {
        return article.id;
    });
}

module.exports.get = id => {
    return conn.query('SELECT * FROM Article WHERE id = ? ORDER BY updated DESC',  [id]).then(transform);
}

module.exports.getPage = (index, count) => {
    return conn.query('SELECT * FROM Article ORDER BY updated DESC LIMIT ? OFFSET ?',  [count, index]).then(transform);
}

module.exports.getAll = () => {
    return conn.query('SELECT * FROM Article ORDER BY updated DESC').then(transform);
}

function transform(articles) {
    articles.forEach(article => {
        article.body = article.body.toString('utf-8');
        article.excerpt = article.excerpt.toString('utf-8');
    });

    return articles;
}