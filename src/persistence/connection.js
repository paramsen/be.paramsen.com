// Connection to db
const mysql = require('mysql');

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PW,
    database: process.env.DB_NAME
});

module.exports.query = (query, values) => {
    return new Promise((resolve, reject) => {
        if(values) {
            pool.query(query, values, (error, results, fields) => {
                if(error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        } else {
            pool.query(query, (error, results, fields) => {
                if(error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
        }

    });
};

module.exports.put = (query, value) => {
    return new Promise((resolve, reject) => {
        pool.query(query, value, (error, result) => {
            if(error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
};

module.exports.pool = pool;

module.exports.close = pool.end;