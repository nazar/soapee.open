exports.up = function(knex) {
  return knex.schema.table('posts', (table) => {
    table.string('title', 200);
  });
};

exports.down = function(knex) {
  return knex.schema.table('posts', (table) => {
    table.dropColumn('title');
  });
};
