exports.up = function(knex) {
  return knex.raw('truncate table images')
    .then(() => knex.schema.table('images', (table) => {
      table.integer('storage').notNullable();
    }))
};

exports.down = function(knex) {
  return knex.schema.table('images', (table) => {
    table.dropColumn('storage');
  });
};
