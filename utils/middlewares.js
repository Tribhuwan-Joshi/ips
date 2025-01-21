const jwt = require('jsonwebtoken');
const { JWT_SECRET, WSIZE, RLIMIT, ALIMIT } = require('./config');
const prisma = require('../prisma/prisma');
const redis = require('./redisClient');

const extractUser = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: 'No token provided' });
  const token = authHeader.split(' ')[1];
  console.log('token is ', token);
  if (!token) {
    return res.status(401).json({ message: 'Invalid token format' });
  }

  try {
    const userInfo = jwt.verify(token, JWT_SECRET);
    const user = await prisma.user.findUnique({ where: { id: userInfo.id } });
    if (!user) {
      return res.status(400).json({ error: 'User not found. Signup' });
    }
    req.user = user;
    console.log('Request generated by', user);
    next();
  } catch (err) {
    console.log(err.message);
    if (err.name == 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token Expired' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};
const limiter = (limit, group) => async (req, res, next) => {
  try {
    const key = `${req.ip}/${group}`;
    const currTime = Date.now();
    await redis.zremrangebyscore(key, 0, currTime - WSIZE);
    const rqs = await redis.zcard(key);
    if (rqs >= limit) {
      const firstReq = Number((await redis.zrange(key, 0, 0))[0]);
      const cooldown = firstReq + WSIZE - currTime;

      return res
        .status(429)
        .json({ error: 'Too many api requests', cooldown: cooldown });
    }
    await redis.zadd(key, currTime, currTime);

    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error });
  }
};

const rateLimit = limiter(RLIMIT, 'api');
const authLimit = limiter(ALIMIT, 'auth');

module.exports = { extractUser, rateLimit, authLimit };
