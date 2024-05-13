import _ from 'lodash';

import Feed from 'models/feed';

export default function newComment({ comment, user, commentable, trx }) {
  return Feed
    .query(trx)
    .insert({
      feedableId: comment.id,
      feedableType: 'comments',
      userId: user.id,
      feedMeta: {
        type: 'newComment',
        v: 1,
        comment: _.pick(comment, ['id', 'comment', 'commentableId', 'commentableType']),
        commentable: _.pick(commentable, ['id', 'name', 'title'])
      }
    })
    .returning('*');

  // todo - once feeds_users is in check if this comment's user is a friend or a user I am following
}
