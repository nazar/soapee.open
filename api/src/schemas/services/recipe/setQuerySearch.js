import _ from 'lodash';
import { raw, ref } from 'objection';

export default function setQuerySearch({ query, search, user, tableName = 'recipes' }) {
  const userId = _.get(user, 'id');
  const oilIds = _.get(search, 'oilIds', []);

  if (oilIds.length) {
    query.whereExists((qb) => {
      qb
        .select('recipe_oils.recipeId')
        .from('recipe_oils')
        .whereIn('recipe_oils.oilId', oilIds)
        .where('recipe_oils.recipeId', '=', raw(`${tableName}.id`))
        .groupBy('recipe_oils.recipeId')
        .having(raw('count(*)'), '=', oilIds.length);
    });
  }

  const additiveId = search?.additiveId;

  if (additiveId) {
    query.whereIn(`${tableName}.id`, (qb) => {
      qb
        .select('recipe_additives.recipeId')
        .from('recipe_additives')
        .where({ additiveId, userId });
    });
  }

  const soapTypes = _.get(search, 'soapTypes', []);

  if (soapTypes.length) {
    query.whereIn(raw("settings ->> 'soapType'"), soapTypes);
  }

  const properties = _.get(search, 'properties');

  if (!_.isEmpty(properties)) {
    _.each(properties, ({ min, max }, property) => {
      const whitelist = ['ins', 'bubbly', 'iodine', 'stable', 'hardness', 'cleansing', 'condition'];
      const queryProperty = _.includes(whitelist, property) ? property : null;

      if (queryProperty) {
        query.whereBetween(ref(`summary:properties.${queryProperty}`), [min, max]);
      }
    });
  }

  const showDeleted = search?.showDeleted;

  if (!(showDeleted)) {
    query.whereNull(`${tableName}.deletedAt`);
  }

  const name = _.get(search, 'name');

  if (name) {
    query.where('weighted_tsv', '@@', raw('websearch_to_tsquery(?)', [name]));
  }

  const searchUserId = _.get(search, 'userId');

  searchUserId && query.where({ userId: searchUserId });
}
