import _ from 'lodash';
import Bluebird from 'bluebird';
import { transaction } from 'objection';

import Post from 'models/post';

import updatePostTaggables from 'schemas/services/forumTaggable/updatePostTaggables';
import updateForumTagCounts from 'schemas/services/forumTag/updateForumTagCounts';

import updatePost from './updatePost';

export default function updateForumPost({ user, input }) {
  const { id, forumTags } = input;

  let trx;

  return Bluebird
    .resolve(transaction.start(Post.knex()))
    .then(res => (trx = res))
    .then(updateThePost)
    .tap(linkForumTags)
    .tapCatch(() => trx.rollback())
    .tap(() => trx.commit());

  // implementation

  function linkForumTags() {
    return updatePostTaggables({ postId: id, forumTags, trx })
      .then((forumTaggables) => updateForumTagCounts({
        forumTags: _.map(forumTaggables, 'forum_tag_id'),
        trx
      }));
  }

  function updateThePost() {
    return updatePost({ user, input, trx });
  }
}
