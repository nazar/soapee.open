import config from 'config';
import knex from 'knex';

// const util = require('util');

const knexConfig = {
  client: 'pg',
  connection: config.get('database.connection'),
  searchPath: config.get('database.searchPath')
};

module.exports = knex(knexConfig);
//   .on('query', data => console.log( 'Executing SQL', util.inspect({ query: data.sql, bindings: data.bindings }, { depth: 10 }) ));
