import _ from 'lodash';

import { stripAllHtml } from 'services/sanitiseHtml';

export default function newCommentNotificationForPostParticipants({ comment, post, sourceUser, trx }) {
  const notificationMeta = {
    type: 'postParticipant',
    v: 1,
    title: post.title,
    commentExcerpt: _.truncate(stripAllHtml(comment.comment)),
    commentTarget: {
      targetType: comment.commentableType,
      targetId: comment.commentableId
    },
    postTarget: {
      targetType: post.postableType,
      targetId: post.postableId
    }
  };

  return trx
    .raw(`
      insert into notifications (notifiable_id, notifiable_type, source_user_id, target_user_id, notification_meta)    
      select distinct
       :notifiableId::int, 
       :notifiableType, 
       :sourceUserId::int,
       comments.user_id, 
       :notificationMeta::jsonb
    from comments
    where comments.commentable_id = :postId
    and comments.commentable_type = 'posts'
    and comments.user_id != :sourceUserId  
    returning *
    `, {
      notifiableId: post.id,
      notifiableType: 'posts',
      sourceUserId: sourceUser.id,
      postId: post.id,
      notificationMeta: JSON.stringify(notificationMeta)
    });
}
