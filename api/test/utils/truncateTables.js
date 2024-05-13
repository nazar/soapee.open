import _ from 'lodash';
import Bluebird from 'bluebird';

import dataSpec from '../fixtures';
import knex from './knex';

export default function truncateTables(...tables) {
  const spec = _.isEmpty(tables) ? dataSpec : _.pick(dataSpec, tables);
  const tablesToDelete = _.keys(spec);

  return Bluebird.each(tablesToDelete, table =>
    knex.raw(`TRUNCATE TABLE ${table} cascade`)
  );
}
