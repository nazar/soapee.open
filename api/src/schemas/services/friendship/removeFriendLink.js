import Bluebird from 'bluebird';
import { transaction } from 'objection';

import Friendship from 'models/friendship';

export default async function removeFriendLink({ toUserId, user }) {
  const trx = await transaction.start(Friendship.knex());

  return Bluebird.resolve(
    Friendship
      .query(trx)
      .delete()
      .where({
        userId: user.id,
        friendId: toUserId
      })
      .returning('*')
      .first()
  )
    .tap(() => {
      return Friendship
        .query(trx)
        .delete()
        .where({
          userId: toUserId,
          friendId: user.id
        });
    })
    .tap(() => trx.commit())
    .tapCatch(() => trx.rollback());
}
