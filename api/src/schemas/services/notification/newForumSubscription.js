import Notification from 'models/notification';

export default function newForumSubscription({ sourceUser, targetUserId, forum, trx }) {
  if (targetUserId !== sourceUser.id) {
    return Notification
      .query(trx)
      .insert({
        notifiableId: forum.id,
        notifiableType: 'forums',
        sourceUserId: sourceUser.id,
        targetUserId,
        notificationMeta: {
          type: 'forumSubscribed',
          v: 1,
          name: forum.name
        }
      })
      .returning('*');
  }
}
