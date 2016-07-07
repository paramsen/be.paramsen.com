const conn = require('../connection'),
    log = require('../../base/dependency').log;

module.exports.put = article => {
    return conn.put('INSERT INTO Article (title, body, created, updated) VALUES (?, ?, ?, ?)', [article.title, article.body, article.created, article.updated]);
}

module.exports.update = article => {
    return conn.put('UPDATE Article SET title = ?, body = ?, updated = ? WHERE id = ?', [article.title, article.body, article.updated, article.id]).then(success => {
        return article.id;
    });
}

module.exports.get = id => {
    log.info(id);
    return conn.query('SELECT * FROM Article WHERE id = ?',  [id]).then(transform);
}

module.exports.getAll = () => {
    return conn.query('SELECT * FROM Article').then(transform);
}

function transform(articles) {
    articles.forEach(article => {
        article.body = article.body.toString('utf-8');
    });

    return articles;
}