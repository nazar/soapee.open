exports.up = function(knex) {
  return knex.schema.alterTable('recipe_oils', function(t) {
    t.dropIndex('recipe_id')
  })
};

exports.down = function(knex) {
  return knex.schema.alterTable('recipe_oils', function(t) {
    t.index('recipe_id')
  })
};
