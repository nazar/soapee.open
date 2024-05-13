exports.up = function(knex) {
  return knex.schema.createTable('reports', (table) => {
    table.increments().primary();

    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('users.id');

    table.text('reportable_type').notNullable();
    table.integer('reportable_id').unsigned().notNullable();
    table.integer('report').unsigned().notNullable();
    table.text('notes');

    table.timestamp('reviewed_at');
    table.integer('reviewed_by_id').unsigned();
    table.foreign('reviewed_by_id').references('users.id');

    table.unique(['reportable_id', 'user_id', 'reportable_type'], 'user_unique_reports');

    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('reports');
};
