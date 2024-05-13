exports.up = function(knex) {
  return knex
    .raw('ALTER TABLE forums DROP CONSTRAINT forums_name_unique')
    .then(() => knex.raw('CREATE UNIQUE INDEX forum_name_index ON forums ((lower(name)))'));
};

exports.down = function(knex) {
  return knex.raw('DROP INDEX forum_name_index')
    .then(() => {
      return knex.schema.table('forums', (table) => {
        table.unique('name');
      });
    });
};
