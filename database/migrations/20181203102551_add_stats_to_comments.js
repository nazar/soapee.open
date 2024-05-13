exports.up = function(knex) {
  return knex.schema.table('comments', (table) => {
    table.jsonb('stats');
  });
};

exports.down = function(knex) {
  return knex.schema.table('comments', (table) => {
    table.dropColumn('stats');
  });
};
