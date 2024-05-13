import _ from 'lodash';

import Notification from 'models/notification';
import { stripAllHtml } from 'services/sanitiseHtml';

export default function newComment({ comment, sourceUser, targetUser, trx }) {
  if (targetUser.id !== sourceUser.id) {
    return Notification
      .query(trx)
      .insert({
        notifiableId: comment.id,
        notifiableType: 'comments',
        sourceUserId: sourceUser.id,
        targetUserId: targetUser.id,
        notificationMeta: {
          type: 'comment',
          v: 1,
          commentExcerpt: _.truncate(stripAllHtml(comment.comment)),
          commentTarget: {
            targetType: comment.commentableType,
            targetId: comment.commentableId
          }
        }
      })
      .returning('*');
  }
}
