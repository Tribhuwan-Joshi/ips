const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./config');
const { default: prisma } = require('../prisma/prisma');
const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader)
    return res.status(401).json({ message: 'No token provided' });
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Invalid token format' });
  }

  try {
    const userInfo = jwt.verify(token, JWT_SECRET);
    req.user = await prisma.user.find({ id: userInfo.id });
    next();
  } catch (err) {
    if (err.name == 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token Expired' });
    }
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = { authenticate };
