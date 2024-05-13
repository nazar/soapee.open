exports.up = function(knex) {
  return knex.schema.createTable('forums_moderators', (table) => {
    table.increments().primary();

    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('users.id');

    table.integer('added_by_user_id').unsigned().notNullable();
    table.foreign('added_by_user_id').references('users.id');

    table.integer('forum_id').unsigned().notNullable();
    table.foreign('forum_id').references('forums.id');

    table.unique(['forum_id', 'user_id'], 'forums_moderators_unique');

    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('forums_moderators');
};
