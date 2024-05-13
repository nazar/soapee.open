exports.up = function(knex) {
  return knex.schema.createTable('forums_official', (table) => {
    table.increments().primary();

    table.integer('forum_id').unsigned().notNullable().unique();
    table.foreign('forum_id').references('forums.id');

    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('forums_official');
};
