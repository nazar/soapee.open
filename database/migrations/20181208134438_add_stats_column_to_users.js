exports.up = function(knex) {
  return knex.schema.table('users', (table) => {
    table.jsonb('stats');
  });
};

exports.down = function(knex) {
  return knex.schema.table('users', (table) => {
    table.dropColumn('stats');
  });
};
