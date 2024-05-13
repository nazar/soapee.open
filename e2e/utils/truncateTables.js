const _ = require('lodash');
const Bluebird = require('bluebird');

const dataSpec = require('../dbFixtures');
const knex = require('./knex');

const tablesToDelete = _.keys(dataSpec);

return Bluebird.each(tablesToDelete, table =>
  knex.raw(`TRUNCATE TABLE ${table} CASCADE`)
)
  .then(
    () => {
      process.exit(0);
    },
    (e) => {
      console.log('e', e);
      process.exit(1);
    }
  );
