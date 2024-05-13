export default function newPostInSubscribedForum({ post, forum, sourceUser, trx }) {
  const notificationMeta = {
    type: 'subscribedForumPost',
    v: 1,
    title: post.title,
    forum: { id: forum.id, name: forum.name }
  };

  return trx
    .raw(`
      insert into notifications (notifiable_id, notifiable_type, source_user_id, target_user_id, notification_meta)    
      select 
       :notifiableId::int, 
       :notifiableType, 
       :sourceUserId::int,
       forums_users_subscriptions.user_id, 
       :notificationMeta::jsonb
    from forums_users_subscriptions
    where forums_users_subscriptions.forum_id = :forumId
    and forums_users_subscriptions.user_id != :sourceUserId
    returning *
    `, {
      notifiableId: post.id,
      notifiableType: 'posts',
      sourceUserId: sourceUser.id,
      forumId: forum.id,
      notificationMeta: JSON.stringify(notificationMeta)
    });
}
