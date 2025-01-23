const storage = require('../utils/storage');
const { decode } = require('base64-arraybuffer');
const sharp = require('sharp');
const { Readable } = require('stream');
const prisma = require('../prisma/prisma');

const saveImage = async (file, req) => {
  try {
    const decoded = decode(file.buffer.toString('base64'));
    const originalName = file.originalname;

    const storagePath = `${
      req.user.username
    }/${Date.now()}_${originalName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    console.log('storage path is ', storagePath);

    const { data, error } = await storage
      .from('images')
      .upload(storagePath, decoded, {
        contentType: file.mimetype,
      });
    console.log(data);
    const publicUrl = storage.from('images').getPublicUrl(data.path);
    // save image to db
    await prisma.image.create({
      data: {
        originalName: file.originalname,
        path: data.path,
        publicLink: publicUrl.data.publicUrl,
        userId: req.user.id,
        size: file.size,
      },
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    throw error;
  }
};

const getTransformedImg = async (image, transformation, req) => {
  const res = await fetch(image.publicLink);
  const readStream = Readable.fromWeb(res.body);
  let transformer = sharp();
  if ('resize' in transformation) {
    transformer = transformer.resize({
      width: transformation.resize.width,
      height: transformation.resize.height,
    });
  }
  if ('crop' in transformation) {
    transformer = transformer.extract({
      left: transformation.crop.x,
      top: transformation.crop.y,
      width: transformation.crop.width,
      height: transformation.crop.height,
    });
  }

  if ('rotate' in transformation) {
    transformer = transformer.rotate(transformation.rotate);
    console.log('add rotating');
  }
  if ('format' in transformation) {
    transformer = transformer.toFormat(transformation.format);
  }
  if ('filters' in transformation) {
    // loop the object
    const filters = transformation.filters;
    for (const filter in filters) {
      if (filter == 'grayscale') {
        transformer = transformer.grayscale();
      }
    }
  }
  if ('sharpen' in transformation) {
    transformer = transformer.sharpen();
  }
  if ('blur' in transformation) {
    transformer = transformer.blur();
  }

  const buffer = await transformer.toFormat(transformation.format).toBuffer();

  const { data, error } = await storage
    .from('images')
    .upload(`${image.path}trans`, buffer);
  console.log(data);
  const publicUrl = storage.from('images').getPublicUrl(data.path);
  // save image to db
  await prisma.image.create({
    data: {
      originalName: image.originalname,
      path: data.path,
      publicLink: publicUrl.data.publicUrl,
      userId: req.user.id,
      size: image.size,
    },
  });

  await prisma.user.update({
    data: {
      storageLeft: req.user.storageLeft - image.size,
    },
    where: {
      id: req.user.id,
    },
  });

  return { publicUrl, storageLeft: req.user.storageLeft - image.size };
};

module.exports = { saveImage, getTransformedImg };
