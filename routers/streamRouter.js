const { Router } = require('express');
const fs = require('fs');
const zlib = require('zlib');
const streamRouter = Router();

streamRouter.get('/', async (req, res) => {
  const stream = fs.createReadStream('./stream_dummy/stream.txt', 'utf-8');
  stream.on('data', (chunk) => res.write(chunk));
  stream.on('end', () => res.end());
});

streamRouter.get('/zip', async (req, res) => {
  fs.createReadStream('./stream_dummy/stream.txt')
    .pipe(
      zlib.createGzip().pipe(fs.createWriteStream('./stream_dummy/stream.zip'))
    )
    .on('finish', () => res.download('./stream_dummy/stream.zip'));
});

module.exports = streamRouter;
