exports.up = function(knex) {
  return knex.schema.table('oils', (table) => {
    table.jsonb('stats');
  });
};

exports.down = function(knex) {
  return knex.schema.table('oils', (table) => {
    table.dropColumn('stats');
  });
};
