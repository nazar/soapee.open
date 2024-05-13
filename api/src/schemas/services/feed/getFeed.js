import _ from 'lodash';

import Feed from 'models/feed';

export default function getFeed({ page, order } = {}) {
  return _.tap(Feed.query(), (query) => {
    const limit = page?.limit;
    const offset = page?.offset;

    if (limit && limit > 100) {
      throw new Error('Invalid request');
    }

    limit && query.limit(limit);
    offset && query.offset(offset);

    if (order?.field) {
      const { field } = order;
      const direction = order.direction || 'desc';

      query.orderBy(field, direction);
    }
  });
}
