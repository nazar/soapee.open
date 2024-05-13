import _ from 'lodash';
import Bluebird from 'bluebird';
import { raw, transaction } from 'objection';

import Oil from 'models/oil';
import Forum from 'models/forum';
import Post from 'models/post';

import { emptyObjectChecker, ForbiddenError } from 'services/errors';
import sanitiseHtml, { stripAllHtml } from 'services/sanitiseHtml';

export default function updatePost({ user, input, trx: extTrx }) {
  const { id, content, title } = input;
  const internalTrx = _.isEmpty(extTrx);

  let trx;
  let dbPost;
  let dbPostable;

  return Bluebird
    .resolve(extTrx || transaction.start(Post.knex()))
    .then(res => (trx = res))
    .then(getPost)
    .then(getPostable)
    .then(checkIfCanEdit)
    .then(updateDbPost)
    .tapCatch(() => internalTrx && trx.rollback())
    .tap(() => internalTrx && trx.commit())
    .then(() => dbPost);

  // implementation

  function getPost() {
    return Bluebird
      .resolve(
        Post
          .query(trx)
          .findById(id)
      )
      .tap(emptyObjectChecker)
      .then(res => (dbPost = res));
  }

  function getPostable() {
    const model = postableTypes[dbPost.postableType];

    if (model) {
      return model
        .query(trx)
        .findById(dbPost.postableId)
        .then(res => (dbPostable = res));
    }
  }

  function checkIfCanEdit() {
    const isPostOwner = Number(user.id) !== Number(dbPost.userId);
    const userIsAdmin = user.isAdmin;
    const userIsForumOwnerIfThisIsAForumPost = (dbPost.postableType === 'forums') &&
      (Number(dbPostable.userId) === Number(user.id));

    if (!(isPostOwner || userIsAdmin || userIsForumOwnerIfThisIsAForumPost)) {
      throw new ForbiddenError('Not object owner');
    }
  }

  function updateDbPost() {
    return dbPost
      .$query(trx)
      .patch({
        title,
        content: sanitiseHtml(content),
        weightedTsv: raw(
          "setweight(to_tsvector('english', COALESCE(:title,'')), 'A') || " +
          "setweight(to_tsvector('english', COALESCE(:content,'')), 'B')",
          {
            title: dbPost.title,
            content: stripAllHtml(content)
          }
        ),
        lastEdited: new Date()
      })
      .returning('*')
      .first()
      .then(res => (dbPost = res));
  }
}

const postableTypes = {
  oils: Oil,
  forums: Forum
};
