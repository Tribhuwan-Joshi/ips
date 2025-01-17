require('dotenv').config();

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;
const STORAGE_URL = process.env.STORAGE_URL;
const API_KEY = process.env.API_KEY;
const SHARE_SECRET = process.env.SHARE_SECRET;

module.exports = {
  PORT,
  JWT_SECRET,
  REFRESH_SECRET,
  STORAGE_URL,
  API_KEY,
  SHARE_SECRET,
};
