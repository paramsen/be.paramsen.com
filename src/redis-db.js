const REDIS_HOST = 'redis';
const REDIS_PORT = 6379;

const dep = require('./dependency'),
	log = dep.log,
    Redis = require('redis');

const redis = Redis.createClient(REDIS_PORT, REDIS_HOST);

const onConnected = () => {
	return new Promise((resolve, reject) => {
		redis.on('connect', () => {
    		log.info('Redis ready');

    		resolve();
		});
	});
};

module.exports.ready = onConnected;
module.exports.instance = redis;