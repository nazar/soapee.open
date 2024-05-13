import _ from 'lodash';
import { raw, ref } from 'objection';

import Post from 'models/post';

export default function getPosts({ search, page, order }) {
  return _.tap(Post.query().whereNotDeleted(), (query) => {
    const limit = _.get(page, 'limit');
    const offset = _.get(page, 'offset');

    if (limit && limit > 100) {
      throw new Error('Invalid request');
    }

    limit && query.limit(limit);
    offset && query.offset(offset);

    search?.userId && query.where({ userId: search.userId });
    search?.searchTerm && query.where('weighted_tsv', '@@', raw('websearch_to_tsquery(?)', [search.searchTerm]));
    search?.postableType && query.where({ postableType: search.postableType });

    if (search?.favouriteForUserId) {
      query.whereIn('id', (qb) => {
        qb
          .select('favourites.favouriteable_id')
          .from('favourites')
          .where({ 'favourites.userId': search.favouriteForUserId })
          .where('favourites.favouriteable_id', '=', raw('posts.id'))
          .where('favourites.favouriteable_type', '=', 'posts');
      });
    }

    if (order) {
      const orderField = {
        score: ref('stats:scores.low'),
        createdAt: 'createdAt'
      }[order.field];

      if (orderField) {
        query.orderBy(orderField, order.direction);
      }
    }
  });
}
