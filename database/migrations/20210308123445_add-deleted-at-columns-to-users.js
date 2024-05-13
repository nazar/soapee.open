exports.up = function(knex) {
  return knex.schema.table('users', (table) => {
    table.datetime('deleted_at');
  });
};

exports.down = function(knex) {
  return knex.schema.table('users', (table) => {
    table.dropColumn('deleted_at');
  });
};
