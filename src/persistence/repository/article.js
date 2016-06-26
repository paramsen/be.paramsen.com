const conn = require('../connection');

module.exports.put = article => {
    return conn.put();
        // .then(success => {
            
        // });
}

module.exports.get = id => {
    return conn.query();
}

module.exports.getAll = () => {
    return conn.query();
}
