const multer = require('multer');
const {
  saveImage,
  getTransformedImg,
  addTransformation,
} = require('../utils/helpers');
const prisma = require('../prisma/prisma');
const storage = require('../utils/storage');
const redis = require('../utils/redisClient');
require('express-async-errors');

const upload = multer({
  storage: multer.memoryStorage(),

  limits: {
    files: 5,
    fileSize: 10 * 1024 * 1024,
  },
});

const jwt = require('jsonwebtoken');
const config = require('../utils/config');
const sharp = require('sharp');

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
  try {
    const id = req.params.id;
    const lkey = `${req.user.id}/imgid`;
    const hkey = `${req.user.id}/imgdata`;
    const CACHE_SIZE = 10;

    const list = await redis.lrange(lkey, 0, -1);
    const isCached = list.includes(id);

    if (isCached) {
      console.log('Cache hit!');

      await redis.lrem(lkey, 0, id);
      await redis.lpush(lkey, id);

      // Return cached image
      const cachedImage = await redis.hget(hkey, id);
      return res
        .status(200)
        .json({ image: JSON.parse(cachedImage), redis: 'hit' });
    }

    console.log('Cache miss! Fetching from DB...');
    const image = await prisma.image.findUnique({
      where: { id: parseInt(id) },
    });

    if (!image) return res.status(404).json({ error: 'Image not found' });
    if (image.userId !== req.user.id)
      return res.status(403).json({ error: 'Forbidden' });

    if (list.length >= CACHE_SIZE) {
      const oldestId = await redis.rpop(lkey); // Remove LRU item
      await redis.hdel(hkey, oldestId);
    }

    await redis.lpush(lkey, id);
    await redis.hset(hkey, id, JSON.stringify(image));

    return res.status(200).json({ image, redis: 'miss' });
  } catch (error) {
    console.error('Error fetching image:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
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
  if (!id) {
    return res
      .status(400)
      .json({ error: 'Provide a valid image id to transform' });
  }

  try {
    // Find the image belonging to the authenticated user
    const image = await prisma.image.findFirst({
      where: {
        id: id,
        userId: req.user.id, // Ensure the image belongs to the authenticated user
      },
    });

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Fetch the image from Supabase storage using native fetch
    const response = await fetch(image.publicLink);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    // Convert the response to a buffer
    const arrayBuffer = await response.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    // Apply transformations using the helper function
    const outputFormat =
      req.body.transformations.format ||
      image.publicLink.split('.').pop().toLowerCase();

    // Apply transformations using the helper function
    const transformer = addTransformation({
      ...req.body.transformations,
      format: outputFormat, // Ensure the format is always set
    });

    // Pass the image buffer to the Sharp instance and get the transformed buffer
    const transformedImageBuffer = await sharp(imageBuffer)
      .pipe(transformer) // Pipe the image buffer through the transformer
      .toBuffer();

    // Calculate the size of the transformed image
    const transformedImageSize = transformedImageBuffer.length;

    // Check if the user has enough storage left
    if (req.user.storageLeft < transformedImageSize) {
      return res.status(400).json({ error: 'Insufficient storage left' });
    }

    // Upload the transformed image to Supabase storage
    const transformedImagePath = `${
      req.user.username
    }/transformed_${Date.now()}.${
      req.body.transformations.format || image.publicLink.split('.').pop()
    }`;
    const { error: uploadError } = await storage
      .from('images') // Replace with your bucket name
      .upload(transformedImagePath, transformedImageBuffer, {
        contentType: `image/${outputFormat}`,
      });

    if (uploadError) {
      console.log(uploadError);
      return res
        .status(500)
        .json({ error: 'Failed to upload transformed image' });
    }

    // Get the public URL of the transformed image
    const {
      data: { publicUrl },
    } = storage.from('images').getPublicUrl(transformedImagePath);

    // Update the user's storageLeft
    const updatedStorageLeft = req.user.storageLeft - transformedImageSize;
    await prisma.user.update({
      where: { id: req.user.id },
      data: { storageLeft: updatedStorageLeft },
    });

    // Save the transformed image metadata to the database
    await prisma.image.create({
      data: {
        originalName: `transformed_${Date.now()}`,
        path: transformedImagePath,
        size: transformedImageSize,
        publicLink: publicUrl,
        userId: req.user.id,
      },
    });

    // Return the public URL and updated storageLeft
    res.status(200).json({
      transformedImageUrl: publicUrl,
      storageLeft: updatedStorageLeft,
    });
  } catch (error) {
    console.error('Error transforming image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
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
