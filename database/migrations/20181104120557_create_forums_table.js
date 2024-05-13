exports.up = function(knex) {
  return knex.schema.createTable('forums', (table) => {
    table.increments().primary();

    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('users.id');

    table.text('name').unique().notNullable();
    table.text('summary').notNullable();
    table.text('banner').notNullable();

    table.enu('forum_type', ['public', 'restricted', 'invite']).notNullable();

    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('forums');
};
