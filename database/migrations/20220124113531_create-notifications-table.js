exports.up = function(knex) {
  return knex.schema.createTable('notifications', (table) => {
    table.increments().primary();

    table.integer('notifiable_id').notNullable().index();
    table.string('notifiable_type').notNullable();

    table.integer('source_user_id').notNullable().index();
    table.foreign('source_user_id').references('users.id');
    table.integer('target_user_id').notNullable().index();
    table.foreign('target_user_id').references('users.id');

    table.boolean('read').defaultTo(false);
    table.timestamp('read_on').index();

    table.jsonb('notification_meta');

    table.timestamps(true, true);
    table.index('created_at');
  })
};

exports.down = function(knex) {
  return knex.schema.dropTable('notifications');
};
