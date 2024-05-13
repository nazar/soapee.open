import _ from 'lodash';
import config from 'config';
import { knexSnakeCaseMappers } from 'objection';
import httpContext from 'express-http-context';

import logger from 'services/logger';

const knex = require('knex')({
  client: 'pg',
  connection: config.get('database.connection'),
  searchPath: config.get('database.searchPath'),
  pool: config.get('database.pool'),
  ...knexSnakeCaseMappers()
});

export default knex;

export function jsonArrayToPgParams(input) {
  return _.chain(input).map(() => '?').join(',').value();
}

const times = {};

knex
  .on('query', (query) => {
    const uid = query.__knexQueryUid;

    times[uid] = {
      startTime: Date.now()
    };
  })
  .on('query-error', (error, query) => {
    const uid = query.__knexQueryUid;
    const requestId = httpContext.get('requestId');

    logger.error(
      'query-error',
      {
        error,
        requestId,
        sql: query.sql,
        bindings: query.bindings
      }
    );

    uid && delete times[uid];
  })
  .on('query-response', (response, query) => {
    const uid = query.__knexQueryUid;
    const { startTime } = times[uid];
    const elapsedTime = Date.now() - startTime;
    const requestId = httpContext.get('requestId');

    logger.sql(
      'query-response',
      {
        requestId,
        sql: query.sql,
        bindings: query.bindings,
        responseLength: (response || []).length,
        elapsedTime
      }
    );

    delete times[uid];
  });
