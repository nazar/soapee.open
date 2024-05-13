import _ from 'lodash';
import { raw } from 'objection';

import Comment from 'models/comment';

export default function getComments({ search, user, page, order }) {
  return _.tap(Comment.query(), (query) => {
    const limit = _.get(page, 'limit');
    const offset = _.get(page, 'offset');

    if (limit && limit > 100) {
      throw new Error('Invalid request');
    }

    limit && query.limit(limit);
    offset && query.offset(offset);

    const searchUserId = search?.userId;

    if (searchUserId) {
      query.where({ 'comments.userId': searchUserId });
    }

    // the user object is only passed in from the User schema to display
    // the current users comments.
    // if user is absent or searchUserId doesn't match user.id then hide
    // the requested user's comments on private recipes
    if (searchUserId && Number(searchUserId) !== Number(user?.id)) {
      // exclude comments on private recipes
      query
        .whereNotExists((qb) => {
          qb
            .select(raw('1'))
            .from('recipes')
            .where({ 'recipes.id': raw('comments.commentable_id') })
            .where({ 'comments.commentableType': raw("'recipes'") })
            .where('recipes.visibility', '!=', 1);
        });
    }

    // favouriteForUserId is from User.myFavouriteComments
    const favouriteForUserId = search?.favouriteForUserId;

    if (favouriteForUserId) {
      query
        .whereIn('comments.id', (qb) => {
          qb.select('favourites.favouriteable_id')
            .from('favourites')
            .where({
              'favourites.favouriteableType': 'comments',
              'favourites.userId': favouriteForUserId
            });
        });
    }

    if (order) {
      const orderField = {
        score: [raw(`comments.stats #> '{scores,low}' ${order.direction} nulls last`)],
        createdAt: 'createdAt'
      }[order.field];

      if (orderField) {
        if (_.isArray(orderField)) {
          query.orderByRaw(orderField[0]);
        } else {
          query.orderBy(orderField, order.direction);
        }
      }
    }
  });
}
