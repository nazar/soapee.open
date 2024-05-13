import Bluebird from 'bluebird';
import { transaction } from 'objection';

import Comment from 'models/comment';
import Post from 'models/post';
import User from 'models/user';

import { emptyObjectChecker } from 'services/errors';
import updateUserKarma from 'schemas/services/user/updateUserKarma';

import checkModerationAccess from './checkModerationAccess';
import updatePostablePostAndCommentCounts from './updatePostablePostAndCommentCounts';

export default function deletePost({ user, id }) {
  let trx;
  let dbPost;
  let targetUser;

  return Bluebird
    .resolve(transaction.start(Post.knex()))
    .then(res => (trx = res))
    .then(getPostAndPostable)
    .then(getTargetUser)
    .then(() => checkModerationAccess({ post: dbPost, user, trx }))
    .then(deleteDbPost)
    .then(deletePostComments)
    .then(() => updatePostablePostAndCommentCounts({ post: dbPost, trx }))
    .then(() => updateUserKarma({ targetUser, trx }))
    .tapCatch(() => trx.rollback())
    .tap(() => trx.commit())
    .then(() => dbPost);

  // implementation

  function getPostAndPostable() {
    return Bluebird
      .resolve(
        Post
          .query(trx)
          .findById(id)
      )
      .tap(emptyObjectChecker)
      .then(res => (dbPost = res));
  }

  function getTargetUser() {
    return User
      .query(trx)
      .findById(dbPost.userId)
      .then(res => (targetUser = res));
  }

  function deleteDbPost() {
    return dbPost
      .$query(trx)
      .patch({
        deletedAt: new Date(),
        deletedByUserId: user.id
      })
      .returning('*')
      .first()
      .then(res => (dbPost = res));
  }

  function deletePostComments() {
    return Comment
      .query(trx)
      .patch({
        deletedAt: 'now()',
        deletedByUserId: user.id
      })
      .where({
        commentableType: 'posts',
        commentableId: dbPost.id
      });
  }
}
