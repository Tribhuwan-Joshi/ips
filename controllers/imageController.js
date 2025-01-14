const multer = require('multer');
const { saveImage } = require('../utils/helpers');
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
    return res.status(500).json({ message: error });
  }
  return res.status(201).json({ message: 'Image uploaded successfully' });
};

const uploadMiddleware = [upload.array('images'), handleUpload];

module.exports = { uploadMiddleware };
