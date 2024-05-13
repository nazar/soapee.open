exports.up = function(knex) {
  return knex.schema.table('verifications', (table) => {
    table.datetime('deleted_at');
  });
};

exports.down = function(knex) {
  return knex.schema.table('verifications', (table) => {
    table.dropColumn('deleted_at');
  });
};
