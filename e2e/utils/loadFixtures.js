const SqlFixtures = require('sql-fixtures');

const dataSpec = require('../dbFixtures');
const knex = require('./knex');
const resetSequences = require('./resetSequences');

const fixtureCreator = new SqlFixtures(knex);

fixtureCreator.create(dataSpec)
  .then(() => resetSequences(dataSpec))
  .then(
    () => {
      process.exit(0);
    },
    (e) => {
      console.log('e', e);
      process.exit(1);
    });
