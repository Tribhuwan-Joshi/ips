const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authController = require('./controllers/authController');
const authRouter = require('./routers/authRouter');

app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.get('/test', (req, res) => res.send('Cool').status(200));
app.use('/auth', authRouter);

module.exports = app;
