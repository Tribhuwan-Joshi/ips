const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRouter = require('./routers/authRouter');
const morgan = require('morgan');
const userRouter = require('./routers/userRouter');
const imageRouter = require('./routers/imageRouter');
const { extractUser, rateLimit, authLimit } = require('./utils/middlewares');

// const streamRouter = require('./routers/streamRouter');

app.use(morgan('common'));
app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.get('/', (req, res) =>
  res.send('This is a image processing and upload service').status(200)
);
// app.use('/stream', streamRouter);  testing router for streaming ( may use in future)

app.use('/auth', authLimit, authRouter); // I have hardcoded these values for demo purposes
app.use(extractUser);
app.use(rateLimit);
app.use('/user', userRouter);
app.use('/images', imageRouter);

module.exports = app;
