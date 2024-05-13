import _ from 'lodash';
import { transaction, ForeignKeyViolationError } from 'objection';
import Bluebird from 'bluebird';

import Forum from 'models/forum';
import { emptyObjectChecker, ForbiddenError, UserInputError } from 'services/errors';
import sanitiseHtml from 'services/sanitiseHtml';

import createForumTags from 'schemas/services/forumTag/createForumTags';
import deleteForumTags from 'schemas/services/forumTag/deleteForumTags';
import updateForumTags from 'schemas/services/forumTag/updateForumTags';

import { updateForumSchema } from './schema';

export default async function updateForum({ id, user, input }) {
  const { summary, banner, forumTags, forumType } = await updateForumSchema.validate(input, { strict: true });

  let dbForum;

  const trx = await transaction.start(Forum.knex());

  return Bluebird
    .resolve()
    .then(getForum)
    .then(manageForumTags)
    .then(updateForum)
    .tap(() => trx.commit())
    .tapCatch(() => trx.rollback());

  function getForum() {
    return Bluebird
      .resolve(
        Forum
          .query(trx)
          .findById(id)
      )
      .tap(emptyObjectChecker)
      .tap((forum) => {
        if (forum.userId !== user.id) {
          throw new ForbiddenError('Only the forum owner can update');
        }
      })
      .then((res) => (dbForum = res));
  }

  function manageForumTags() {
    const updates = _.chain(forumTags).filter(({ id }) => id).value();
    const creates = _.chain(forumTags).filter(({ id }) => !(id)).value();

    return Bluebird.all([
      createForumTags({ forum: dbForum, forumTags: creates, user, trx }),
      deleteForumTags({ forum: dbForum, forumTags: updates, trx }),
      updateForumTags({ forumTags: updates, trx })
    ])
      .catch(ForeignKeyViolationError, (e) => {
        // eslint-disable-next-line max-len
        throw new UserInputError('Could not delete Forum Tag as it is in use', { code: 'tag_in_use', detail: e.nativeError.detail });
      });
  }

  function updateForum() {
    return Forum
      .query(trx)
      .patchAndFetchById(id, {
        summary,
        banner: sanitiseHtml(banner),
        forumType
      });
  }
}
