exports.up = function(knex) {
  return knex.schema.createTable('forums_locked', (table) => {
    table.increments().primary();

    table.integer('locked_by_user_id').unsigned().notNullable();
    table.foreign('locked_by_user_id').references('users.id');

    table.integer('forum_id').unsigned().notNullable();
    table.foreign('forum_id').references('forums.id');

    table.timestamp('deleted_at');
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('forums_locked');
};
