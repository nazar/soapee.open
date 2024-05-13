exports.up = function(knex) {
  return knex.schema.table('posts', (table) => {
    table.boolean('locked');
    table.integer('locked_by_user_id').unsigned();
    table.foreign('locked_by_user_id').references('users.id');
    table.timestamp('locked_at');
  });
};

exports.down = function(knex) {
  return knex.schema.table('posts', (table) => {
    table.dropColumn('locked');
    table.dropColumn('locked_at');
    table.dropColumn('locked_by_user_id');
  });
};
