import _ from 'lodash';
import Bluebird from 'bluebird';
import { ref, transaction } from 'objection';

import Friendship from 'models/friendship';
import Notification from 'models/notification';

import acceptedFriendRequest from 'schemas/services/notification/acceptedFriendRequest';
import newFriendRequest from 'schemas/services/notification/newFriendRequest';

export default async function makeFriendLink({ toUserId, user }) {
  const trx = await transaction.start(Friendship.knex());

  let approving;

  return Bluebird
    .resolve()
    .then(isRequestingOrApproving)
    .then(createFriendRequest)
    .tap(markSourceNotificationApproved)
    .tap(sendNotification)
    .tap(() => trx.commit())
    .tapCatch(() => trx.rollback());

  //

  function isRequestingOrApproving() {
    return Friendship
      .query(trx)
      .findOne({
        userId: toUserId,
        friendId: user.id
      })
      .then((res) => (approving = !(_.isEmpty(res))));
  }

  function createFriendRequest() {
    return Friendship
      .query(trx)
      .insert({
        userId: user.id,
        friendId: toUserId
      })
      .returning('*');
  }

  function markSourceNotificationApproved(newFriendship) {
    if (approving) {
      return Notification
        .query(trx)
        .findOne({
          sourceUserId: toUserId,
          targetUserId: user.id
        })
        .where(ref('notificationMeta:type'), '"friendRequest"')
        .then((res) => {
          if (res) {
            return res
              .$query(trx)
              .patch({
                notificationMeta: {
                  ...res.notificationMeta,
                  friendship: {
                    id: newFriendship.id,
                    approvedAt: new Date()
                  }
                }
              });
          }
        });
    }
  }

  function sendNotification(friendship) {
    if (approving) {
      return acceptedFriendRequest({ sourceUser: user, targetUserId: toUserId, friendship, trx });
    } else {
      return newFriendRequest({ sourceUser: user, targetUserId: toUserId, friendship, trx });
    }
  }
}
