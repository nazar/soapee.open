exports.up = function(knex) {
  return knex.schema.table('comments', (table) => {
    table.timestamp('last_edited');
  });
};

exports.down = function(knex) {
  return knex.schema.table('comments', (table) => {
    table.dropColumn('last_edited');
  });
};
