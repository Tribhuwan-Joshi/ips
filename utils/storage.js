const { StorageClient } = require('@supabase/storage-js');
const config = require('./config');
const supabaseUrl = config.STORAGE_URL;
const supabaseKey = config.API_KEY;

module.exports = new StorageClient(supabaseUrl, {
  apikey: supabaseKey,
  Authorization: `Bearer ${supabaseKey}`,
});
