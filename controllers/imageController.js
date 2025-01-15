const multer = require('multer');
const { saveImage } = require('../utils/helpers');
const prisma = require('../prisma/prisma');
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
  try {
    for (let file of files) {
      await saveImage(file, req);
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error });
  }
  return res.status(201).json({ message: 'Image uploaded successfully' });
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

module.exports = { uploadMiddleware, getAllImages };
