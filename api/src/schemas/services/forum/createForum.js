import _ from 'lodash';
import Bluebird from 'bluebird';
import { transaction } from 'objection';

import Forum from 'models/forum';

import createForumTags from 'schemas/services/forumTag/createForumTags';
import updateUserKarma from 'schemas/services/user/updateUserKarma';
import sanitiseHtml from 'services/sanitiseHtml';

import { createForumSchema } from './schema';

export default async function createForum({ user, input }) {
  const { name, summary, banner, forumTags, forumType } = await createForumSchema.validate(input, { strict: true });

  let forum;
  let trx;

  return Bluebird
    .resolve(transaction.start(Forum.knex()))
    .then(res => (trx = res))
    .then(createForum)
    .then(createAndLinkForumTags)
    .then(() => updateUserKarma({ targetUser: user, trx }))
    .then(() => trx.commit())
    .tapCatch(() => trx.rollback())
    .then(() => forum);


  // implementation

  function createForum() {
    return Forum
      .query(trx)
      .insert({
        userId: user.id,
        name,
        summary,
        banner: sanitiseHtml(banner),
        forumType
      })
      .returning('*')
      .then(res => (forum = res));
  }

  function createAndLinkForumTags() {
    if (!(_.isEmpty(forumTags))) {
      return createForumTags({ forum, forumTags, user, trx });
    }
  }
}
