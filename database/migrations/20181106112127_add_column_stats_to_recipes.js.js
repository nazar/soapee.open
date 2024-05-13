exports.up = function(knex) {
  return knex.schema.table('recipes', (table) => {
    table.jsonb('stats');
  });
};

exports.down = function(knex) {
  return knex.schema.table('recipes', (table) => {
    table.dropColumn('stats');
  });
};
