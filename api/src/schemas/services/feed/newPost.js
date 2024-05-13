import _ from 'lodash';

import Feed from 'models/feed';

export default function newPost({ post, postable, user, trx }) {
  return Feed
    .query(trx)
    .insert({
      feedableId: post.id,
      feedableType: 'posts',
      userId: user.id,
      feedMeta: {
        type: 'newPost',
        v: 1,
        post: _.pick(post, ['id', 'title', 'postableId', 'postableType']),
        postable: _.pick(postable, ['id', 'name'])
      }
    })
    .returning('*');

  // todo - once feeds_users is in check if this post's user is a friend or a user I am following
}
