exports.up = function(knex) {
  return knex.schema.table('recipes', (table) => {
    table.index('visibility');
    table.index('created_at');
  });
};

exports.down = function(knex) {
  return knex.schema.table('recipes', (table) => {
    table.dropIndex('visibility');
    table.dropIndex('created_at');
  });
};
