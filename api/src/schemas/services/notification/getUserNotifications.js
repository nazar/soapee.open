import _ from 'lodash';

import Notification from 'models/notification';

export default function getUserNotifications({ page = {}, search = {}, order = {}, user }) {
  return _.tap(Notification.query(), (query) => {
    query.where({ targetUserId: user.id });

    const { limit, offset } = page;

    if (limit && limit > 100) {
      throw new Error('Invalid request');
    }

    limit && query.limit(limit);
    offset && query.offset(offset);

    const { field, direction } = order;

    field && query.orderBy(field, direction);

    const { readStatus } = search;

    readStatus && readStatus !== 'any' && query.where({ read: readStatus === 'read' });
  });
}
