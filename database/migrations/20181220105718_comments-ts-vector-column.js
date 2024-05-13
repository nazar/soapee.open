exports.up = function(knex) {
  return knex.schema.table('comments', (table) => {
    table.specificType('weighted_tsv', 'tsvector');
    table.index('weighted_tsv', null, 'gist');
  });
};

exports.down = function(knex) {
  return knex.schema.table('comments', (table) => {
    table.dropColumn('weighted_tsv');
  });
};
