import _ from 'lodash';
import Bluebird from 'bluebird';
import { transaction } from 'objection';

import Comment from 'models/comment';
import Post from 'models/post';
import Reaction from 'models/reaction';
import Recipe from 'models/recipe';

import newReaction from 'schemas/services/notification/newReaction';
import { emptyObjectChecker } from 'services/errors';


export default async function({ user, input }) {
  const { reactionableId, reactionableType, reaction } = input;
  const trx = await transaction.start(Reaction.knex());

  let dbReaction;
  let reactionable;
  let addedReaction;

  return Bluebird
    .resolve(getReactionable())
    .then(toggleReaction)
    .then(updateReactionableStats)
    .then(notifyObjectOwnerOfReaction)
    .tap(() => trx.commit())
    .tapCatch(() => trx.rollback())
    .then(() => dbReaction);

  // implementation

  function getReactionable() {
    const favouriteTypeMap = {
      comments: Comment,
      posts: Post,
      recipes: Recipe
    };

    const Model = favouriteTypeMap[reactionableType];

    return Bluebird
      .resolve(
        Model
          .query(trx)
          .findById(reactionableId)
      )
      .tap(emptyObjectChecker)
      .tap((res) => (reactionable = res));
  }

  function toggleReaction() {
    const packet = { reactionableId, reactionableType, userId: user.id, reaction };

    return Reaction
      .query(trx)
      .where(packet)
      .first()
      .then((res) => {
        if (_.isNil(res)) {
          return Reaction
            .query(trx)
            .insert(packet)
            .returning('*')
            .then(res2 => {
              dbReaction = res2;
              addedReaction = true;
            });
        } else {
          return res
            .$query(trx)
            .delete()
            .returning('*')
            .then(res2 => (dbReaction = res2));
        }
      });
  }

  function updateReactionableStats() {
    const sql = `
WITH reactions_count AS (
    SELECT count(id) AS count
    FROM reactions
    WHERE reactionable_id = :reactionableId
    AND reactionable_type = :reactionableType
)

update :reactionableType: reactionableType SET
  stats = jsonb_set(
    coalesce(stats, '{}'::jsonb), 
    '{reactions}'::text[], jsonb_build_object('reactions', reactions_count.count),
    true
  )
from reactions_count 
  where reactionableType.id = :reactionableId  
  `;

    return trx.raw(sql, {
      reactionableId,
      reactionableType
    });
  }

  function notifyObjectOwnerOfReaction() {
    if (addedReaction) {
      return newReaction({
        reaction: dbReaction,
        reactionable,
        targetUser: { id: reactionable.userId },
        sourceUser: user,
        trx
      });
    }
  }
}
