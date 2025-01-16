const storage = require('../utils/storage');
const { decode } = require('base64-arraybuffer');
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

module.exports = { saveImage };
