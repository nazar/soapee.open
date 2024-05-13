exports.up = function(knex) {
  return knex.schema.createTable('users_admins', (table) => {
    table.increments().primary();

    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('users.id');

    table.integer('added_by_user_id').unsigned().notNullable();
    table.foreign('added_by_user_id').references('users.id');

    table.unique(['user_id'], 'users_admins_unique');

    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users_admins');
};
