import Notification from 'models/notification';

export default function newPostInMyForum({ post, forum, sourceUser, targetUser, trx }) {
  if (targetUser.id !== sourceUser.id) {
    return Notification
      .query(trx)
      .insert({
        notifiableId: post.id,
        notifiableType: 'posts',
        sourceUserId: sourceUser.id,
        targetUserId: targetUser.id,
        notificationMeta: {
          type: 'myForumPost',
          v: 1,
          title: post.title,
          forum: { id: forum.id, name: forum.name }
        }
      })
      .returning('*');
  }
}
