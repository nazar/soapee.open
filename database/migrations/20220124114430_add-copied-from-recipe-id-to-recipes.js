exports.up = function(knex) {
  return knex.schema.table('recipes', (table) => {
    table.integer('from_recipe_id').index();
  });
};

exports.down = function(knex) {
  return knex.schema.table('recipes', (table) => {
    table.dropColumn('from_recipe_id');
  });
};
