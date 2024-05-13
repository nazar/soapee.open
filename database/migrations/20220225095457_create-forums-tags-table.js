exports.up = function(knex) {
  return knex.schema.createTable('forums_tags', (table) => {
    table.increments().primary();

    table.integer('forum_id').notNullable().index();
    table.foreign('forum_id').references('forums.id');

    table.string('tag');
    table.string('color');
    table.jsonb('stats');

    table.integer('user_id').notNullable().index();
    table.foreign('user_id').references('users.id');

    table.timestamps(true, true);
  })
    .then(() => knex.raw(`CREATE UNIQUE INDEX forums_tags_unique_tags ON forums_tags (forum_id, LOWER(tag))`));
};

exports.down = function(knex) {
  return knex.schema.dropTable('forums_tags');
};
