const Router = require('express').Router;
const authController = require('../controllers/authController');
const authRouter = Router();

authRouter.post('/login', authController.handleLogin);
authRouter.post('/register', authController.handleRegister);
authRouter.post('/refreshtoken', authController.handleRefreshToken);

module.exports = authRouter;
