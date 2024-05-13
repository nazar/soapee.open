exports.up = function(knex) {
  return knex.schema.createTable('posts', (table) => {
    table.increments().primary();

    table.integer('forum_id').unsigned().notNullable();
    table.foreign('forum_id').references('forums.id');
    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('users.id');

    table.text('content').notNullable();

    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('posts');
};
