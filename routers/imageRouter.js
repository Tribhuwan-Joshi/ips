const Router = require('express').Router;
const imageController = require('../controllers/imageController');
const imageRouter = Router();
require('express-async-errors');

imageRouter.get('/shared/:id', imageController.getSharedImage);
imageRouter.post('/:id/transform', imageController.transformImage);
imageRouter.post('/:id/share', imageController.shareImage);
imageRouter.delete('/:id', imageController.deleteImagewithId);
imageRouter.get('/:id', imageController.getImagewithId);
imageRouter.get('/', imageController.getAllImages);
imageRouter.post('/', imageController.uploadMiddleware);

module.exports = imageRouter;
