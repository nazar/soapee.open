import { ref } from 'objection';

import Post from 'models/post';

import metaForums from './metaForums';

export default function getPostablePosts({
  postable,
  page: { offset, limit } = {},
  order
}) {
  const orderField = {
    score: ref('stats:scores.low'),
    latestActivity: 'commentedAt',
    createdAt: 'createdAt'
  }[order?.field];

  const isMeta = metaForums[postable.name];

  const sub = isMeta ?
    Post.query().whereNotDeleted() :
    postable.$relatedQuery('posts').whereNotDeleted();

  offset && sub.offset(offset);
  limit && sub.limit(limit);
  orderField && sub.orderBy(orderField, order.direction);

  return sub;
}
