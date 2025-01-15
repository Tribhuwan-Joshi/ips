const Router = require('express').Router;
const imageController = require('../controllers/imageController');
const imageRouter = Router();

imageRouter.get('/:id', imageController.getImagewithId);
imageRouter.delete('/:id', imageController.deleteImagewithId);

imageRouter.get('/', imageController.getAllImages);
imageRouter.post('/', imageController.uploadMiddleware);

module.exports = imageRouter;
