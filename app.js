const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRouter = require('./routers/authRouter');
const morgan = require('morgan');
const userRouter = require('./routers/userRouter');
const imageRouter = require('./routers/imageRouter');
const { extractUser } = require('./utils/middlewares');

app.use(morgan('tiny'));
app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.get('/', (req, res) =>
  res.send('This is a image processing and upload service').status(200)
);
app.use('/auth', authRouter);
app.use('/users', userRouter);
app.use('/images', imageRouter);

module.exports = app;
