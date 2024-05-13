exports.up = function(knex) {
  return knex.schema.createTable('favourites', (table) => {
    table.increments().primary();

    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('users.id');

    table.text('favouriteable_type').notNullable();
    table.integer('favouriteable_id').unsigned().notNullable();

    table.unique(['favouriteable_id', 'favouriteable_type', 'user_id'], 'user_unique_favourites');

    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('favourites');
};
