exports.up = function(knex) {
  return knex.schema.createTable('feeds', (table) => {
    table.increments().primary();

    table.integer('feedable_id').notNullable().index();
    table.string('feedable_type').notNullable();

    table.integer('user_id').notNullable().index();
    table.foreign('user_id').references('users.id');

    table.jsonb('feed_meta');

    table.timestamps(true, true);
  })
    .then(() => knex.raw('create index feeds_created_at_desc on feeds (created_at desc)'))
};

exports.down = function(knex) {
  return knex.schema.dropTable('feeds');
};
