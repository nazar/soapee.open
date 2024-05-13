import { raw } from 'objection';

import Comment from 'models/comment';

export default function updateCommentableStats({ commentable, commentableType, trx }) {
  return Comment
    .query(trx)
    .count('id as count')
    .where({
      commentableId: commentable.id,
      commentableType
    })
    .first()
    .then(({ count }) => commentable
      .$query(trx)
      .patch({
        stats: raw("jsonb_set(coalesce(stats, '{}'::jsonb), ?, ?, true)", ['{comments}', {
          comments: Number(count)
        }])
      })
    );
}
