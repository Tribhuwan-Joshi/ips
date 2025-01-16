const multer = require('multer');
const { saveImage } = require('../utils/helpers');
const prisma = require('../prisma/prisma');
const storage = require('../utils/storage');
const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    files: 5,
    fileSize: 10 * 1024 * 1024,
  },
});

const handleUpload = async (req, res) => {
  // save to supabase directly for now
  const files = req.files;
  console.log(files);
  if (!files.length) {
    return res.status(400).json({ message: 'Please provide a valid image' });
  }
  const totalSize = files.reduce((res, file) => res + file.size, 0);
  if (totalSize > req.user.storageLeft) {
    return res.status(403).json({
      error: 'User storage limit exceeded. Unable to upload these file(s).',
      storageLeft: req.user.storageLeft,
    });
  }
  try {
    for (let file of files) {
      await saveImage(file, req, res);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error });
  }
  await prisma.user.update({
    data: {
      storageLeft: req.user.storageLeft - totalSize,
    },
    where: {
      id: req.user.id,
    },
  });
  return res.status(201).json({
    message: 'Image uploaded successfully',
    storageLeft: req.user.storageLeft - totalSize,
  });
};

const uploadMiddleware = [upload.array('images'), handleUpload];

const getAllImages = async (req, res) => {
  const userId = req.user.id;
  const allImages = await prisma.image.findMany({
    where: {
      userId: userId,
    },
  });
  res.status(200).json({ message: 'Fetched all images', data: allImages });
};

const getImagewithId = async (req, res) => {
  const id = parseInt(req.params.id);
  const image = await prisma.image.findUnique({
    where: {
      id: id,
    },
  });
  if (!image) return res.status(404).json({ error: 'Image not found' });
  if (image.userId != req.user.id)
    return res.status(403).json({ error: 'Forbidden' });

  return res.status(200).json({ image: image });
};

const deleteImagewithId = async (req, res) => {
  const id = parseInt(req.params.id);
  // remove from postgresql
  const img = await prisma.image.findUnique({
    where: {
      id: id,
    },
    select: {
      path: true,
      userId: true,
      size: true,
    },
  });
  if (!img) return res.status(404).json({ error: 'Image not found' });
  const { path, userId, size } = img;
  if (userId != req.user.id)
    return res.status(403).json({ error: 'Forbidden' });
  await storage.from('images').remove([path]);

  await prisma.image.delete({
    where: {
      id: id,
    },
  });
  await prisma.user.update({
    data: {
      storageLeft: req.user.storageLeft + size,
    },
    where: {
      id: req.user.id,
    },
  });

  return res.status(200).json({
    message: `deleted image with id ${id}`,
    storageLeft: req.user.storageLeft + size,
  });
};
module.exports = {
  deleteImagewithId,
  uploadMiddleware,
  getAllImages,
  getImagewithId,
};
