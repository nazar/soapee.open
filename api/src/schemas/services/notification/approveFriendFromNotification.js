import _ from 'lodash';
import Bluebird from 'bluebird';
import { transaction } from 'objection';

import Friendship from 'models/friendship';
import Notification from 'models/notification';
import { UserInputError } from 'services/errors';

import acceptedFriendRequest from './acceptedFriendRequest';

export default async function approveFriendFromNotification({ notificationId, user }) {
  const trx = await transaction.start(Friendship.knex());

  let newFriendship;
  let notification;

  return Bluebird
    .resolve()
    .then(getNotification)
    .then(checkIfFriendshipExists)
    .then(createFriendship)
    .then(updateNotification)
    .tap(sendNotificationApproved)
    .tap(() => trx.commit())
    .tapCatch(() => trx.rollback());

  //

  function getNotification() {
    return Notification
      .query(trx)
      .findById(notificationId)
      .then((res) => {
        if (res?.targetUserId === user.id) {
          notification = res;
        } else {
          throw new UserInputError('Notification target mismatch', { notification: res, user });
        }
      });
  }

  function checkIfFriendshipExists() {
    return Friendship
      .query(trx)
      .findOne({
        userId: user.id,
        friendId: notification.sourceUserId
      })
      .then((res) => {
        if (!(_.isEmpty(res))) {
          throw new UserInputError('Friendship already exists', { friendship: res, notification, user });
        }
      });
  }

  function createFriendship() {
    return Friendship
      .query(trx)
      .insert({
        userId: user.id,
        friendId: notification.sourceUserId
      })
      .returning('*')
      .then(res => (newFriendship = res));
  }

  function updateNotification() {
    return Notification
      .query(trx)
      .updateAndFetchById(notification.id, {
        notificationMeta: {
          ...notification.notificationMeta,
          friendship: {
            id: newFriendship.id,
            approvedAt: new Date()
          }
        }
      });
  }

  function sendNotificationApproved() {
    return acceptedFriendRequest({
      friendship: newFriendship,
      sourceUser: user,
      targetUserId: notification.sourceUserId,
      trx
    });
  }
}
