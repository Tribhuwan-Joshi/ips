const { REDIS_URL } = require('./config');

const Redis = require('ioredis');
const redis = new Redis(REDIS_URL);

module.exports = redis;
