const knex = require('knex');
const config = require('config');

const databaseName = config.get('database.name');

const connection = {
  client: 'pg',
  connection: `${config.get('database.connection')}/`
};

const databaseUri = `${config.get('database.connection')}/${databaseName}`;

module.exports.databaseUri = databaseUri;

module.exports.createDatabase = function createDatabase() {
  const blankDb = knex(connection);

  return blankDb.raw(`DROP DATABASE IF EXISTS ${databaseName}`)
    .then(() => blankDb.raw(`CREATE DATABASE ${databaseName}`))
    .then(() => {
      blankDb.destroy();
    });
};

module.exports.dropDatabase = function createDatabase() {
  const blankDb = knex(connection);

  return blankDb.raw(`DROP DATABASE IF EXISTS ${databaseName}`)
    .then(() => {
      blankDb.destroy();
    });
};
