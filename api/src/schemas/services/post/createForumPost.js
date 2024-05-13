import _ from 'lodash';
import Bluebird from 'bluebird';
import { transaction } from 'objection';

import Forum from 'models/forum';
import ForumLocked from 'models/forumLocked';
import Post from 'models/post';

import updatePostTaggables from 'schemas/services/forumTaggable/updatePostTaggables';
import updateForumTagCounts from 'schemas/services/forumTag/updateForumTagCounts';
import newPostInSubscribedForum from 'schemas/services/notification/newPostInSubscribedForum';
import newPostInMyForum from 'schemas/services/notification/newPostInMyForum';

import { emptyObjectChecker, UserInputError } from 'services/errors';

import createPost from './createPost';

// todo add yup validation

export default async function createForumPost({ user, input }) {
  const { forumId, forumTags } = input;

  const lockedForum = await ForumLocked
    .query()
    .whereNotDeleted()
    .where({ forumId })
    .limit(1);

  if (!(_.isEmpty(lockedForum))) {
    throw new UserInputError('Cannot create a post on this Forum as it is locked');
  }

  let dbForum;
  let dbPost;
  let trx;

  return Bluebird
    .resolve(transaction.start(Post.knex()))
    .then(res => (trx = res))
    .then(getForum)
    .then(createDbPost)
    .then(linkForumTags)
    .then(NotifyForumSubscribers)
    .then(NotifyForumOwner)
    .tapCatch(() => trx.rollback())
    .tap(() => trx.commit())
    .then(() => dbPost);

  // implementation

  function getForum() {
    return Bluebird
      .resolve(
        Forum
          .query(trx)
          .findById(forumId)
      )
      .tap(emptyObjectChecker)
      .then(res => (dbForum = res));
  }

  function createDbPost() {
    return createPost({
      trx,
      extPostable: dbForum,
      user,
      input: {
        postableId: forumId,
        postableType: 'forums',
        title: input.title,
        content: input.content
      }
    })
      .then((res) => (dbPost = res));
  }

  function linkForumTags() {
    if (!(_.isEmpty(forumTags))) {
      return updatePostTaggables({ postId: dbPost.id, forumTags, trx })
        .then((forumTaggables) => updateForumTagCounts({
          forumTags: _.map(forumTaggables, 'forum_tag_id'),
          trx
        }));
    }
  }

  function NotifyForumSubscribers() {
    return newPostInSubscribedForum({
      post: dbPost,
      forum: dbForum,
      sourceUser: user,
      trx
    });
  }

  function NotifyForumOwner() {
    return newPostInMyForum({
      post: dbPost,
      forum: dbForum,
      sourceUser: user,
      targetUser: { id: dbForum.userId },
      trx
    });
  }
}
