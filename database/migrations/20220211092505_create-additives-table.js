exports.up = function(knex) {
  return knex.schema.createTable('additives', (table) => {
    table.increments().primary();

    table.string('name').notNullable();
    table.text('notes');
    table.jsonb('stats');

    table.integer('user_id').notNullable();
    table.foreign('user_id').references('users.id');

    table.timestamps(true, true);
    table.timestamp('deleted_at');
  })
    .then(() => knex.raw("ALTER TABLE additives add COLUMN weighted_tsv tsvector generated always AS (to_tsvector('english', name)) stored"))
    .then(() => knex.raw('CREATE INDEX additives_weighted_tsv_index ON additives USING gist(weighted_tsv)'))
    .then(() => knex.raw('CREATE UNIQUE INDEX additives_unique_user_name_additives ON additives (user_id, LOWER(name))'))
};

exports.down = function(knex) {
  return knex.schema.dropTable('additives');
};
