const Router = require('express').Router;
const imageController = require('../controllers/imageController');
const imageRouter = Router();

imageRouter.post('/', imageController.uploadMiddleware);

module.exports = imageRouter;
