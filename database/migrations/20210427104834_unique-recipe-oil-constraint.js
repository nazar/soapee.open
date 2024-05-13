exports.up = function(knex) {
  return knex.schema.alterTable('recipe_oils', function(t) {
    t.unique(['recipe_id', 'oil_id'])
  })
};

exports.down = function(knex) {
  return knex.schema.alterTable('recipe_oils', function(t) {
    t.dropUnique(['recipe_id', 'oil_id'])
  })
};
