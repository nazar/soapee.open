exports.up = function(knex) {
  return knex.schema.createTable('votes', (table) => {
    table.increments().primary();

    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('users.id');

    table.text('voteable_type').notNullable();
    table.integer('voteable_id').unsigned().notNullable();
    table.specificType('vote', 'smallint').defaultTo(1);

    table.unique(['voteable_id', 'user_id', 'voteable_type'], 'user_unique_votes');

    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('votes');
};
