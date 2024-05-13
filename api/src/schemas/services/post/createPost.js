import _ from 'lodash';
import Bluebird from 'bluebird';
import { raw, transaction } from 'objection';

import Oil from 'models/oil';
import Post from 'models/post';

import createVote from 'schemas/services/vote/createVote';
import newPost from 'schemas/services/feed/newPost';

import sanitiseHtml, { stripAllHtml } from 'services/sanitiseHtml';
import { emptyObjectChecker } from 'services/errors';

import updatePostablePostAndCommentCounts from './updatePostablePostAndCommentCounts';

// todo add yup validation

export default async function createPost({ user, trx: extTrx, extPostable, input }) {
  const { postableId, postableType, title, content } = input;
  const internalTrx = _.isEmpty(extTrx);

  const postableTypeMap = {
    oils: Oil
  };

  const Model = postableTypeMap[postableType];

  let postable;
  let dbPost;
  let trx;

  return Bluebird
    .resolve(extTrx || transaction.start(Post.knex()))
    .then(res => (trx = res))
    .then(getPostable)
    .then(createDbPost)
    .then(upvoteMyPost)
    .then(addPostToFeed)
    .then(reloadPost)
    .then(() => updatePostablePostAndCommentCounts({ post: dbPost, trx }))
    .tapCatch(() => internalTrx && trx.rollback())
    .tap(() => internalTrx && trx.commit())
    .then(() => dbPost);

  // implementation

  function getPostable() {
    if (extPostable) {
      postable = extPostable;
    } else {
      return Bluebird
        .resolve(
          Model
            .query(trx)
            .findById(postableId)
        )
        .tap(emptyObjectChecker)
        .then(res => (postable = res));
    }
  }

  function createDbPost() {
    return postable
      .$relatedQuery('posts', trx)
      .insert({
        userId: user.id,
        title,
        content: sanitiseHtml(content),
        commentedAt: 'now()',
        weightedTsv: raw(
          "setweight(to_tsvector('english', COALESCE(:title,'')), 'A') || " +
          "setweight(to_tsvector('english', COALESCE(:content,'')), 'B')",
          {
            title,
            content: stripAllHtml(content)
          }
        )
      })
      .returning('*')
      .then(res => (dbPost = res));
  }

  function upvoteMyPost() {
    return createVote({
      trx,
      user,
      input: {
        voteableId: dbPost.id,
        voteableType: 'posts',
        vote: 1
      }
    });
  }

  function addPostToFeed() {
    return newPost({ post: dbPost, postable, user, trx });
  }

  function reloadPost() {
    return Post
      .query(trx)
      .findById(dbPost.id)
      .then(res => (dbPost = res));
  }
}
