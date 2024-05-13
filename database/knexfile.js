const config = require('config');

module.exports = {
  client: 'pg',
  connection: config.get('database.connection'),
  searchPath: config.get('database.searchPath')
};
