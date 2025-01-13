require('dotenv').config();

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_SECRET;
const PROJECT_URL = process.env.PROJECT_URL;
const API_KEY = process.env.API_KEY;

module.exports = { PORT, JWT_SECRET, REFRESH_SECRET, PROJECT_URL, API_KEY };
