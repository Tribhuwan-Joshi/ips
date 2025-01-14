const multer = require('multer');
const storage = require('../utils/storage');
const { decode } = require('base64-arraybuffer');
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const handleUpload = async (req, res) => {
  // save to supabase directly for now
  const file = req.file;
  console.log('fileInfo ', file);
  if (!file) {
    return res.status(400).json({ message: 'Please provide a valid image' });
  }
  try {
    const decoded = decode(file.buffer.toString('base64'));
    const originalName = req.file.originalname;
    const storagePath = `${Date.now()}_${originalName.replace(
      /[^a-zA-Z0-9.-]/g,
      '_'
    )}`;
    console.log('storage path is ', storagePath);
    const { data, error } = await storage
      .from('images')
      .upload(storagePath, decoded, {
        contentType: file.mimetype,
      });
    console.log('data is ', data);
    if (error) {
      console.log(error);
      return res.status(500).json({ message: error.message });
    }

    res.status(201).json({ message: 'Saved image', data });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: error.message });
  }
};

const uploadMiddleware = [upload.single('image'), handleUpload];

module.exports = { uploadMiddleware };
