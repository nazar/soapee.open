exports.up = function(knex) {
  return knex.schema.table('forums', (table) => {
    table.jsonb('stats');
  });
};

exports.down = function(knex) {
  return knex.schema.table('forums', (table) => {
    table.dropColumn('stats');
  });
};
