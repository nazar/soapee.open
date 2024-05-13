exports.up = function(knex) {
  return knex.schema.createTable('recipe_additives', (table) => {
    table.increments().primary();

    table.integer('recipe_id').notNullable();
    table.foreign('recipe_id').references('recipes.id');

    table.integer('additive_id').notNullable().index();
    table.foreign('additive_id').references('additives.id');

    table.unique(['recipe_id', 'additive_id'])

    table.string('weight');

    table.timestamps(true, true);
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('recipe_additives');
};
