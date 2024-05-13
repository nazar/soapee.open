import _ from 'lodash';
import SqlFixtures from 'sql-fixtures';

import dataSpec from '../fixtures';
import knex from './knex';
import resetSequences from './resetSequences';

const fixtureCreator = new SqlFixtures(knex);

export default function loadFixtures(...tables) {
  const spec = _.isEmpty(tables) ? dataSpec : _.pick(dataSpec, tables);

  return fixtureCreator
    .create(spec)
    .then(() => resetSequences(spec));
}
