const storage = require('../utils/storage');
const { decode } = require('base64-arraybuffer');
const sharp = require('sharp');
const { Readable } = require('stream');
const fs = require('fs');
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
const addTransformation = (transformation) => {
  console.log('whole transformations', transformation);

  // Create a Sharp instance and apply transformations
  const transformer = sharp();

  if (transformation.resize) {
    transformer.resize({
      width: transformation.resize.width,
      height: transformation.resize.height,
    });
  }
  if (transformation.crop) {
    transformer.extract({
      left: transformation.crop.x,
      top: transformation.crop.y,
      width: transformation.crop.width,
      height: transformation.crop.height,
    });
  }
  if (transformation.rotate) {
    transformer.rotate(transformation.rotate);
  }
  if (transformation.format) {
    transformer.toFormat(transformation.format);
  }
  if (transformation.filters) {
    if (transformation.filters.grayscale) {
      transformer.grayscale();
    }
  }
  if (transformation.sharpen) {
    transformer.sharpen();
  }
  if (transformation.blur) {
    transformer.blur();
  }
  if (transformation.flip) {
    transformer.flip();
  }

  return transformer;
};

module.exports = { saveImage, addTransformation };
