exports.up = function(knex) {
  return knex.schema.table('recipes', (table) => {
    table.datetime('deleted_at').index();
  });
};

exports.down = function(knex) {
  return knex.schema.table('recipes', (table) => {
    table.dropColumn('deleted_at');
  });
};
