const _ = require('lodash');
const Bluebird = require('bluebird');
const jwt = require('jsonwebtoken');
const SqlFixtures = require('sql-fixtures');

const knex = require('../../utils/knex');
const fixtures = require('../../dbFixtures');

module.exports = (on, config) => {
  on('task', {
    apiLogin({ username, expiresIn = 2000 }) {
      return knex('verifications')
        .where({
          provider_id: username,
          provider_name: 'local'
        })
        .limit(1)
        .then(([verification]) => {
          return knex('users')
            .where({ id: verification.user_id })
            .then(([user]) => {
              return jwt
                .sign({
                  userId: user.id,
                  providerName: verification.provider_name
                },
                config.env.JWT_SECRET,
                { expiresIn }
              );
            });
        });
    },

    resetDb() {
      const tables = _.keys(fixtures);

      return Bluebird
        .each(tables, table => knex.raw(`TRUNCATE TABLE ${table} CASCADE`))
        .then(() => {
          const fixtureCreator = new SqlFixtures(knex);

          return fixtureCreator.create(fixtures);
        })
        .then(() => Bluebird.each(tables, table =>
          knex.raw(`select setval('${table}_id_seq', COALESCE(MAX(id), 1)) from ${table}`)
        ));
    }
  });
};
