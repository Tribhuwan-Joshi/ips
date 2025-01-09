const prisma = require('../prisma/prisma');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const handleRegister = async (req, res) => {
  const { username, password } = req.body;
  if (username.length < 6 || password.length < 6)
    return res.status(400).json({ message: 'Invalid input' });
  const user = await prisma.user.findOne({ username }); // check if user exist
  if (user) {
    return res.status(409).json({ message: 'user already exist' });
  }
  // now create new user, encrypt password using bcrypt-json
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await prisma.user.create({
    data: { username, password: hashedPassword },
  }); // create new user

  // generate a jwt token
  res.status(200).json({ user: newUser });
};

const handleLogin = async (req, res) => {
  const { username, password } = req.body;
  if (username.length < 6 || password.length < 6)
    return res.status(400).json({ message: 'Invalid input' });
  const user = await prisma.user.findOne({ username }); // check if user exist
  if (!user) {
    return res.status(404).json({ message: 'user do not exist' });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(401).json({ message: 'Invalid password' });
  }

  // generate a jwt token
  const jwtToken = jwt.sign({ id: user.id }, JWT_SECRET, {
    expiresIn: '1h',
  });
  const refreshToken = jwt.sign({ id: user.id }, REFRESH_SECRET, {
    expiresIn: '15d',
  });

  res.cookie('refreshtoken', refreshToken, {
    expires: new Date(Date.now() + 48 * 3600000),
    httpOnly: true,
    // secure: true,
  });

  res.status(200).json({ token: jwtToken });
};

const handleRefreshToken = async (req, res) => {
  const refreshtoken = req.cookies['refreshToken'];
  if (!refreshtoken) {
    return res
      .status(401)
      .json({ message: 'No valid refresh token. Login to continue' });
  }
  try {
    // later replace it with error middleware
    const userInfo = jwt.verify(refreshtoken, REFRESH_SECRET);
    const jwtToken = jwt.sign({ id: userInfo.id }, JWT_SECRET);

    return res.status(200).json({ token: jwtToken });
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = { handleLogin, handleRegister, handleRefreshToken };
