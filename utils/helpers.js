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

    if (error) {
      throw error;
    }
  } catch (error) {
    throw error;
  }
};

module.exports = { saveImage };
