exports.up = function(knex) {
  return knex.schema.table('posts', (table) => {
    table.dropColumn('forum_id');

    table.text('postable_type').notNullable();
    table.integer('postable_id').unsigned().notNullable().index();

    table.jsonb('stats');
  });
};

exports.down = function(knex) {
  return knex.schema.table('posts', (table) => {
    table.integer('forum_id').notNullable();

    table.dropColumn('postable_type');
    table.dropColumn('postable_id');
    table.dropColumn('stats');
  });
};
