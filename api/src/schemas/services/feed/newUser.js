import _ from 'lodash';

import Feed from 'models/feed';

export default function newUser({ user, trx }) {
  return Feed
    .query(trx)
    .insert({
      feedableId: user.id,
      feedableType: 'users',
      userId: user.id,
      feedMeta: {
        type: 'newUser',
        v: 1,
        user: _.pick(user, ['id', 'name'])
      }
    })
    .returning('*');
}
