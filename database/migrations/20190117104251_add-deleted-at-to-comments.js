exports.up = function(knex) {
  return knex.schema.table('comments', (table) => {
    table.timestamp('deleted_at');

    table.integer('deleted_by_user_id');
    table.foreign('deleted_by_user_id').references('users.id');
  });
};

exports.down = function(knex) {
  return knex.schema.table('comments', (table) => {
    table.dropColumn('deleted_at');
    table.dropColumn('deleted_by_user_id');
  });
};
