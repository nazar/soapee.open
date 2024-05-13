exports.up = function(knex) {
  return knex.schema.table('recipes', (table) => {
    table.boolean('best');
    table.datetime('best_at');
  });
};

exports.down = function(knex) {
  return knex.schema.table('recipes', (table) => {
    table.dropColumn('best');
    table.dropColumn('best_at');
  });
};
