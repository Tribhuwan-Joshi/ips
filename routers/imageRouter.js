const Router = require('express').Router;
const imageController = require('../controllers/imageController');
const imageRouter = Router();

imageRouter.get('/shared/:id', imageController.getSharedImage);
imageRouter.post('/:id/share', imageController.shareImage);
imageRouter.delete('/:id', imageController.deleteImagewithId);
imageRouter.get('/:id', imageController.getImagewithId);
imageRouter.get('/', imageController.getAllImages);
imageRouter.post('/', imageController.uploadMiddleware);

module.exports = imageRouter;
