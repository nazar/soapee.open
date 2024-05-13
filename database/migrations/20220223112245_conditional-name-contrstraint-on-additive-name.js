exports.up = function(knex) {
  return knex
    .raw('drop index additives_unique_user_name_additives')
    .then(() => knex.raw(`CREATE UNIQUE INDEX additives_unique_user_name_additives ON additives (user_id, LOWER(name)) where (deleted_at is null)`))
};

exports.down = function(knex) {
  return knex
    .raw('drop index additives_unique_user_name_additives')
    .then(() => knex.raw('CREATE UNIQUE INDEX additives_unique_user_name_additives ON additives (user_id, LOWER(name))'))

};
