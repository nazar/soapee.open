import Notification from 'models/notification';

export default function newFriendRequest({ sourceUser, targetUserId, friendship, trx }) {
  if (targetUserId !== sourceUser.id) {
    return Notification
      .query(trx)
      .insert({
        notifiableId: friendship.id,
        notifiableType: 'friendships',
        sourceUserId: sourceUser.id,
        targetUserId,
        notificationMeta: {
          type: 'friendRequest',
          v: 1
        }
      })
      .returning('*');
  }
}
