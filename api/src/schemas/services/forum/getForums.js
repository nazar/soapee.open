import { ref } from 'objection';

import Forum from 'models/forum';

export default function getForums({
  currentUser,
  search: { name, official, mine, subscribed, userId } = {},
  page: { limit, offset } = {},
  order: { field, direction } = {}
}) {
  // fixme - search
  const query = Forum
    .query();

  if (limit && limit > 100) {
    throw new Error('Invalid request');
  }

  limit && query.limit(limit);
  offset && query.offset(offset);

  if (field === 'popular') {
    query.orderBy(ref('stats:comments.comments'), direction);
  } else if (field && direction) {
    query.orderBy(field, direction);
  }

  if (official === true) {
    query.whereIn('forums.id', qb => qb.from('forumsOfficial').select('forumId'));
  } else if (official === false) {
    query.whereNotIn('forums.id', qb => qb.from('forumsOfficial').select('forumId'));
  }

  if (mine) {
    query.where({ userId: currentUser.id });
  } else if (userId) {
    query.where({ userId });
  }

  // TODO - full text search index for name, summary and banner
  name && query.where('name', 'ilike', `%${name}%`);

  if (subscribed) {
    query
      .whereIn('forums.id', (qb) => {
        qb.select('forums_users_subscriptions.forumId')
          .from('forums_users_subscriptions')
          .where('forums_users_subscriptions.forumId', '=', ref('forums.id'))
          .where('forums_users_subscriptions.userId', '=', currentUser.id);
      });
  }

  return query;
}
