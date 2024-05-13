const database = require('./database');

const knex = require('knex')({
  client: 'pg',
  connection: database.databaseUri
});

module.exports = knex;
