import _ from 'lodash';
import Bluebird from 'bluebird';
import { transaction } from 'objection';

import Forum from 'models/forum';
import ForumUserSubscription from 'models/forumUserSubscription';
import newForumSubscription from 'schemas/services/notification/newForumSubscription';

import { emptyObjectChecker } from 'services/errors';

export default async function forumUserSubscriptionToggleCurrentUser({ forumId, user }) {
  const forum = await Forum.query().findById(forumId);

  emptyObjectChecker(forum);

  let forumUserSubscription = await ForumUserSubscription.query().findOne({ forumId, userId: user.id });

  const trx = await transaction.start(Forum.knex());

  return Bluebird
    .resolve()
    .then(toggleSubscription)
    .then(updateForumStats)
    .then(notifyNewForumSubscription)
    .then(() => forumUserSubscription)
    .tap(() => trx.commit())
    .tapCatch(() => trx.rollback());

  function toggleSubscription() {
    return Bluebird
      .try(() => {
        if (_.isNil(forumUserSubscription)) {
          return ForumUserSubscription
            .query(trx)
            .insert({
              forumId,
              userId: user.id
            })
            .returning('*')
            .then((res) => (forumUserSubscription = res));
        } else {
          return forumUserSubscription.$query(trx).delete();
        }
      });
  }

  function updateForumStats() {
    const sql = `
WITH subscriptions_count AS (
    SELECT count(id) AS count
    FROM forums_users_subscriptions
    WHERE forum_id = :forumId
)

update forums  SET
  stats = jsonb_set(
    coalesce(stats, '{}'::jsonb),
    '{subscriptions}'::text[],
    to_jsonb(subscriptions_count.count)
  )
from subscriptions_count 
  where forums.id = :forumId  
  `;

    return trx.raw(sql, { forumId });
  }

  function notifyNewForumSubscription() {
    return newForumSubscription({
      forum,
      sourceUser: user,
      targetUserId: forum.userId,
      trx
    });
  }
}
