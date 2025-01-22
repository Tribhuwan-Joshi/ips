const Router = require('express').Router;
const userController = require('../controllers/userController');
const userRouter = Router();
userRouter.get('/', (req, res) => {
  res.sendStatus(200).json({ user: req.user });
});
userRouter.delete('/', userController.deleteUser);
// userRouter.get('/:id', userController.handleGetInfo);

module.exports = userRouter;
