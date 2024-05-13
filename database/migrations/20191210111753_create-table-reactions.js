exports.up = function(knex) {
  return knex.schema.createTable('reactions', (table) => {
    table.increments().primary();

    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('users.id');

    table.text('reactionable_type').notNullable();
    table.integer('reactionable_id').unsigned().notNullable();
    table.unique(['reactionable_id', 'reactionable_type', 'user_id', 'reaction'], 'user_unique_reactions');

    table.text('reaction');

    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('reactions');
};
