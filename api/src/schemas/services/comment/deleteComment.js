import _ from 'lodash';
import Bluebird from 'bluebird';
import { transaction } from 'objection';

import Comment from 'models/comment';
import Forum from 'models/forum';
import ForumModerator from 'models/forumModerator';
import Post from 'models/post';
import Recipe from 'models/recipe';
import User from 'models/user';
import Vote from 'models/vote';

import updateCommentableStats from 'schemas/services/comment/updateCommentableStats';
import updateUserKarma from 'schemas/services/user/updateUserKarma';
import { emptyObjectChecker, ForbiddenError } from 'services/errors';
import updatePostablePostAndCommentCounts from 'schemas/services/post/updatePostablePostAndCommentCounts';

const commentableTypeMap = {
  posts: Post,
  recipes: Recipe
};

export default function deleteComment({ id, user }) {
  // a comment can be deleted by:
  // 1. the comment owner - comments.userId === user.id
  // 2. the commentable owner - recipes.userId === user.id or a forum moderator if a commentable is a post
  // 3. a site admin
  let trx;
  let dbComment;
  let commentable;
  let targetUser;


  return Bluebird
    .resolve(transaction.start(Comment.knex()))
    .then(res => (trx = res))
    .then(getDbComment)
    .then(getCommentable)
    .then(getTargetUser)
    .then(checkPermissions)
    .then(deleteCommentVotes)
    .then(deleteDbComment)
    .then(() => updateCommentableStats({ commentable, commentableType: dbComment.commentableType, trx }))
    .then(() => updateUserKarma({ targetUser, trx }))
    .then(postProcessIfPost)
    .then(() => trx.commit())
    .tapCatch(() => trx.rollback())
    .then(() => dbComment);

  // implementation

  function getDbComment() {
    return Bluebird
      .resolve(
        Comment
          .query(trx)
          .findById(id)
      )
      .tap(emptyObjectChecker)
      .tap(res => (dbComment = res));
  }

  function getCommentable() {
    const Model = commentableTypeMap[dbComment.commentableType];

    return Bluebird
      .resolve(
        Model
          .query(trx)
          .findById(dbComment.commentableId)
      )
      .tap(emptyObjectChecker)
      .then(res => (commentable = res));
  }

  function getTargetUser() {
    return User
      .query()
      .findById(dbComment.userId)
      .then(res => (targetUser = res));
  }

  function deleteDbComment() {
    return dbComment
      .$query(trx)
      .patch({
        deletedAt: 'now()',
        deletedByUserId: user.id
      });
  }

  function deleteCommentVotes() {
    return Vote
      .query(trx)
      .delete()
      .where({
        voteableId: dbComment.id,
        voteableType: 'comment'
      });
  }

  function postProcessIfPost() {
    if (dbComment.commentableType === 'posts') {
      // this is a post so we need to rollup the stats
      // from this object into its postable - i.e. forum or oil is a postable
      return updatePostablePostAndCommentCounts({ post: commentable, trx });
    }
  }

  function checkPermissions() {
    let hasPermission = user.isAdmin;

    return Bluebird
      .try(() => {
        if (!(hasPermission)) {
          if (Number(dbComment.userId) === Number(user.id)) {
            hasPermission = true;
          } else if (dbComment.commentableType === 'recipes') {
            // check if this is the recipe owner
            return Recipe
              .query(trx)
              .findById(dbComment.commentableId)
              .then((recipe) => {
                if (Number(recipe.userId) === Number(user.id)) {
                  hasPermission = true;
                }
              });
          } else if (dbComment.commentableType === 'posts') {
            return Post
              .query(trx)
              .findById(dbComment.commentableId)
              .then((post) => {
                if (Number(post.userId) === Number(user.id)) {
                  hasPermission = true;
                } else if (post.postableType === 'forums') {
                  return Forum
                    .query(trx)
                    .findById(post.postableId)
                    .then((forum) => {
                      if (Number(forum.userId) === Number(user.id)) {
                        hasPermission = true;
                      } else {
                        return ForumModerator
                          .query(trx)
                          .where({
                            forumId: forum.id,
                            userId: user.id
                          })
                          .limit(1)
                          .first()
                          .then(res => (hasPermission = !(_.isEmpty(res))));
                      }
                    });
                }
              });
          }
        }
      })
      .then(() => {
        if (!(hasPermission)) {
          throw new ForbiddenError();
        }
      });
  }
}
