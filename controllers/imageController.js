const multer = require('multer');
const { saveImage } = require('../utils/helpers');
const prisma = require('../prisma/prisma');
const storage = require('../utils/storage');
const ffmpeg = require('fluent-ffmpeg');
const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    files: 5,
    fileSize: 10 * 1024 * 1024,
  },
});

const jwt = require('jsonwebtoken');
const config = require('../utils/config');

const handleUpload = async (req, res) => {
  // save to supabase directly for now
  const files = req.files;
  console.log(files);
  if (!files || !files.length) {
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
  const page = req.query.page || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const userId = req.user.id;
  const allImages = await prisma.image.findMany({
    where: {
      userId: userId,
    },
    skip: skip,
    take: limit,
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

const getSharedImage = async (req, res) => {
  try {
    const shareId = req.params.id;
    const { url } = jwt.verify(shareId, config.SHARE_SECRET);
    res.status(200).json({ url: url });
    // or redirect user
    // res.redirect(url)
  } catch (err) {
    res.status(500).json({ error: err });
  }
};

const shareImage = async (req, res) => {
  try {
    const { ttl } = req.body;
    if (!ttl)
      return res
        .status(400)
        .json({ message: 'Please provide valid timeperiod in ms' });
    const id = parseInt(req.params.id);
    const img = await prisma.image.findUnique({
      where: {
        id: id,
      },
    });
    if (!img || img.userId != req.user.id) {
      return res.status(404).json({ error: 'Invalid image id to share' });
    }

    const url = img.publicLink;
    const token = jwt.sign({ url: url }, config.SHARE_SECRET, {
      expiresIn: ttl,
    });
    res.status(201).json({ message: 'Image is public now', token: token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
};

const transformImage = async (req, res) => {
  const id = parseInt(req.params.id);
  if (!id)
    return res.status(400).json({ error: 'Please provide id of the image' });
  const image = await prisma.image.findUnique({
    where: {
      id,
    },
    select: {
      userId: true,
      path: true,
      publicLink: true,
    },
  });
  if (!image || image.userId != req.user.id) {
    return res.status(404).json({ error: 'Image not found. Invalid id' });
  }
  const transformations = req.body.transformations;
  /*
Resize - width , height
Crop - width , height , x ,y
Rotate - number
Watermark - string
Flip - boolean
Mirror - boolean
Compress
Change format (JPEG, PNG, etc.) - string 
Apply filters (grayscale, sepia, etc.) - grayscale,sepia
*/

  const proc = ffmpeg(image.publicLink, { timeout: 10000 });
  proc.format(transformations.format);
  console.log(proc);
  res.status(200).json({ url: image.publicLink, path: image.path });
};

module.exports = {
  shareImage,
  getSharedImage,
  deleteImagewithId,
  uploadMiddleware,
  transformImage,
  getAllImages,
  getImagewithId,
};
