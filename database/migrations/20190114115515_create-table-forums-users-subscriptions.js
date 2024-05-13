exports.up = function(knex) {
  return knex.schema.createTable('forums_users_subscriptions', (table) => {
    table.increments().primary();

    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('users.id');

    table.integer('forum_id').unsigned().notNullable();
    table.foreign('forum_id').references('forums.id');

    table.unique(['forum_id', 'user_id'], 'forums_users_unique_subscriptions');

    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('forums_users_subscriptions');
};
