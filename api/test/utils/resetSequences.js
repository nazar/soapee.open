const _ = require('lodash');
const Bluebird = require('bluebird');

const knex = require('./knex');


export default function resetSequences(spec) {
  const tables = _.keys(spec);

  return Bluebird
    .each(tables, table =>
      knex.raw(`select setval('public.${table}_id_seq', COALESCE(MAX(id), 1)) from public.${table}`)
    );
}
