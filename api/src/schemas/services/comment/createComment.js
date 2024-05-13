import Bluebird from 'bluebird';
import { raw, transaction } from 'objection';

import Comment from 'models/comment';
import Post from 'models/post';
import Recipe from 'models/recipe';
import User from 'models/user';

import updateCommentableStats from 'schemas/services/comment/updateCommentableStats';
import newCommentNotification from 'schemas/services/notification/newComment';
// eslint-disable-next-line max-len
import newCommentNotificationForPostParticipants from 'schemas/services/notification/newCommentNotificationForPostParticipants';
import updatePostablePostAndCommentCounts from 'schemas/services/post/updatePostablePostAndCommentCounts';
import createVote from 'schemas/services/vote/createVote';
import currentUserIsFriendOfRecipeOwner from 'schemas/services/recipe/currentUserIsFriendOfRecipeOwner';
import newCommentFeed from 'schemas/services/feed/newComment';

import sanitiseHtml, { stripAllHtml } from 'services/sanitiseHtml';
import { emptyObjectChecker, ForbiddenError } from 'services/errors';


export default function createComment({ user, commentableId, commentableType, comment }) {
  const commentableTypeMap = {
    posts: Post,
    recipes: Recipe
  };

  const Model = commentableTypeMap[commentableType];

  let commentable; // commentable is either a Post or a Recipe
  let dbComment;
  let targetUser;
  let trx;

  return Bluebird
    .resolve(transaction.start(Model.knex()))
    .then(res => (trx = res))
    .then(getCommentable)
    .then(getTargetUser)
    .then(checkPermissions)
    .then(createDbComment)
    .then(setCommentableCommentedAtIfPost)
    .then(upvoteMyComment)
    .then(addCommentToFeedIfCommentableIsPublic)
    .then(notifyComment)
    .then(notifyPostParticipants)
    .then(reloadComment)
    .then(() => updateCommentableStats({ commentable, commentableType, trx }))
    .then(postProcessIfPost)
    .tapCatch(() => trx.rollback())
    .tap(() => trx.commit())
    .then(() => dbComment);

  // implementation

  function getCommentable() {
    return Bluebird
      .resolve(
        Model
          .query(trx)
          .findById(commentableId)
      )
      .tap(emptyObjectChecker)
      .then(res => (commentable = res));
  }

  function getTargetUser() {
    return User
      .query()
      .findById(commentable.userId)
      .then(res => (targetUser = res));
  }

  function checkPermissions() {
    // if the commentable is a post then check if it isn't locked
    // only an admin can post a comment on a locked post
    if (
      commentableType === 'posts' &&
      commentable.locked
    ) {
      if (!(user.isAdmin)) {
        throw new ForbiddenError('Post is locked');
      }
    } else if (commentableType === 'recipes') {
      if (commentable.visibility === 0) {
        // private recipe - only the owner can post a comment
        if (String(commentable.userId) !== String(user.id)) {
          throw new ForbiddenError('Only the recipe owner can add comments');
        }
      } else if (commentable.visibility === 2) {
        // recipe with friends visibility - only me and my friends can comments
        if (String(commentable.userId) !== String(user.id)) {
          return currentUserIsFriendOfRecipeOwner({ recipe: commentable, userId: user.id });
        }
      }
    }
  }

  function createDbComment() {
    return commentable
      .$relatedQuery('comments', trx)
      .insert({
        userId: user.id,
        comment: sanitiseHtml(comment),
        weightedTsv: raw("to_tsvector('english', ?)", [stripAllHtml(comment)])
      })
      .returning('*')
      .then(res => (dbComment = res));
  }

  function setCommentableCommentedAtIfPost() {
    if (commentableType === 'posts') {
      // this is a post so we need to rollup the stats
      // from this object into its postable - i.e. forum or oil is a postable
      return commentable
        .$query(trx)
        .patch({ commentedAt: 'now()' })
        .returning('*')
        .then(res => (commentable = res));
    }
  }

  function upvoteMyComment() {
    return createVote({
      trx,
      user,
      input: {
        voteableId: dbComment.id,
        voteableType: 'comments',
        vote: 1
      }
    });
  }

  function addCommentToFeedIfCommentableIsPublic() {
    const isPublicRecipe = dbComment.commentableType === 'recipes' && commentable.visibility === 1;
    const isNotRecipe = dbComment.commentableType !== 'recipes';

    if (isPublicRecipe || isNotRecipe) {
      return newCommentFeed({ comment: dbComment, commentable, user, trx });
    }
  }

  function notifyComment() {
    return newCommentNotification({ comment: dbComment, commentable, sourceUser: user, targetUser, trx });
  }

  function notifyPostParticipants() {
    if (commentableType === 'posts') {
      return newCommentNotificationForPostParticipants({
        comment: dbComment,
        post: commentable,
        sourceUser: user,
        trx
      });
    }
  }

  function reloadComment() {
    return Comment
      .query(trx)
      .findById(dbComment.id)
      .then(res => (dbComment = res));
  }

  function postProcessIfPost() {
    if (commentableType === 'posts') {
      // this is a post so we need to rollup the stats
      // from this object into its postable - i.e. forum or oil is a postable
      return updatePostablePostAndCommentCounts({ post: commentable, trx });
    }
  }
}
