const { PROJECT_URL, API_KEY } = require('./config');
const { StorageClient } = require('@supabase/storage-js');

const storageClient = new StorageClient(PROJECT_URL, {
  apiKey: API_KEY,
  Authorization: `Bearer ${API_KEY}`,
});

module.exports = StorageClient;
