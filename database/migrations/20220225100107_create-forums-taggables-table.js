exports.up = function(knex) {
  return knex.schema.createTable('forums_taggables', (table) => {
    table.increments().primary();

    table.integer('forum_tag_id').notNullable().index();
    table.foreign('forum_tag_id').references('forums_tags.id');

    table.integer('post_id').notNullable().index();
    table.foreign('post_id').references('posts.id');

    table.unique(['post_id', 'forum_tag_id'])

    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('forums_taggables');
};
