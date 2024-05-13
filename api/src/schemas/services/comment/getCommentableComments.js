import { ref } from 'objection';

export default function getComments({
  commentable,
  order = {},
  page: { offset, limit } = {}
}) {
  const orderField = {
    score: ref('stats:scores.low'),
    createdAt: 'createdAt'
  }[order.field];

  const query = commentable
    .$relatedQuery('comments');

  if (limit && limit > 100) {
    throw new Error('Invalid request');
  }

  offset && query.offset(offset);
  limit && query.limit(limit);
  orderField && query
    .orderBy(orderField, order.direction)
    .orderBy('createdAt', 'asc');

  return query;
}
