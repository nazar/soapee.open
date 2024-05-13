exports.up = function(knex) {
  return knex.schema.table('posts', (table) => {
    table.timestamp('last_edited');
  });
};

exports.down = function(knex) {
  return knex.schema.table('posts', (table) => {
    table.dropColumn('last_edited');
  });
};
