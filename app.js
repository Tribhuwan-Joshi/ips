const express = require('express');
const app = express();
const cors = require('cors');
const cookieParser = require('cookie-parser');
const authRouter = require('./routers/authRouter');
const morgan = require('morgan');
const userRouter = require('./routers/userRouter');
const imageRouter = require('./routers/imageRouter');
const {
  extractUser,
  rateLimit,
  authLimit,
  errorHandler,
} = require('./utils/middlewares');

// const streamRouter = require('./routers/streamRouter');

app.use(morgan('common'));
app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.get('/', (req, res) =>
  res.status(200).send(`
    <html>
      <body>
      <h1>IPS</h1>
        <p>This is the backend for the image processing and upload service.</p>
        <p>Please use any API client (postman) to consume the API.</p>
        <p>Visit the documentation: 
          <a href="https://github.com/Tribhuwan-Joshi/ips" target="_blank">GitHub Docs</a>
        </p>
      </body>
    </html>
  `)
);

// app.use('/stream', streamRouter);  testing router for streaming ( may use in future)

app.use('/auth', authLimit, authRouter); // I have hardcoded these values for demo purposes
app.use(extractUser);
app.use(rateLimit);
app.use('/user', userRouter);
app.use('/images', imageRouter);
app.use(errorHandler);

module.exports = app;
