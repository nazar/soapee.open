import _ from 'lodash';
import Bluebird from 'bluebird';
import * as yup from 'yup';
import { transaction, raw } from 'objection';
import wilson from 'wilson-interval';

import Comment from 'models/comment';
import Post from 'models/post';
import Recipe from 'models/recipe';
import User from 'models/user';
import Vote from 'models/vote';

import { emptyObjectChecker } from 'services/errors';
import updateUserKarma from 'schemas/services/user/updateUserKarma';
import newVote from 'schemas/services/notification/newVote';

export default async function createVote({ user, input: { voteableId, voteableType, vote }, trx: extTrx }) {
  const voteableTypeMap = {
    comments: Comment,
    posts: Post,
    recipes: Recipe
  };

  const Model = voteableTypeMap[voteableType];
  const internalTrx = _.isEmpty(extTrx);
  const trx = extTrx || (await transaction.start(Model.knex()));

  let dbVote;
  let targetUser;
  let voteable;
  let upvoted;

  await validateInputs();

  return Bluebird
    .resolve(getVoteable())
    .then(getTargetUser)
    .then(upsertDbVote)
    .then(updateVoteableStats)
    .then(notifyUpvote)
    .then(() => updateUserKarma({ trx, targetUser }))
    .tapCatch(() => internalTrx && trx.rollback())
    .tap(() => internalTrx && trx.commit())
    .then(() => dbVote);

  // implementation

  function getVoteable() {
    return Bluebird
      .resolve(
        Model
          .query(trx)
          .findById(voteableId)
      )
      .tap(emptyObjectChecker)
      .then(res => (voteable = res));
  }

  function getTargetUser() {
    return User
      .query(trx)
      .findById(voteable.userId)
      .then(res => (targetUser = res));
  }

  // here we either:
  // 1. insert a new up/down vote
  // 2. delete the vote from the same user if toggled
  // 3. update the vote if up -> down or vice versa
  function upsertDbVote() {
    return voteable
      .$relatedQuery('votes', trx)
      .where({ userId: user.id })
      .limit(1)
      .first()
      .then((res) => {
        if (_.isEmpty(res)) {
          upvoted = true;
          // 1. insert a new up/down vote
          return voteable
            .$relatedQuery('votes', trx)
            .insert({
              userId: user.id,
              vote
            })
            .returning('*');
        } else if (Number(vote) !== res.vote) {
          // 2. update the vote if up -> down or vice versa
          return res
            .$query(trx)
            .patch({ vote })
            .returning('*');
        } else {
          // 3. delete the vote from the same user if toggled
          return res
            .$query(trx)
            .delete()
            .returning('*');
        }
      })
      .then(res => (dbVote = res));
  }

  function updateVoteableStats() {
    return Vote
      .query(trx)
      .sum('vote as vote')
      .count('id as count')
      .select(raw('count(id) filter (where vote = 1) as up_vote'))
      .where({
        voteableId,
        voteableType
      })
      .first()
      .then(({ vote: voteScore, count, upVote }) => {
        const { low, center, high } = Number(count) > 0 ? wilson(Number(upVote), Number(count)) : {
          low: 0,
          center: 0,
          high: 0
        };

        // TODO - confirm that count should be for total objects - i.e. all recipes
        return voteable
          .$query(trx)
          .patch({
            stats: raw(`coalesce(stats, '{}'::jsonb) || 
              jsonb_build_object(
                'votes', jsonb_build_object(
                  'score', cast(? as int), 
                  'count', cast(? as int), 
                  'upvotedPercent', cast(? as int)
                ), 
                'scores', jsonb_build_object(
                  'low', cast(? as numeric), 
                  'center', cast(? as numeric), 
                  'high', cast(? as numeric)
                ) 
              )`, [
              Number(voteScore),
              Number(count),
              _.round((Number(upVote) / Number(count)) * 100) || 0,
              Number(low),
              Number(center),
              Number(high)
            ])
          });
      });
  }

  function notifyUpvote() {
    if (upvoted) {
      return newVote({ vote: dbVote, voteable, sourceUser: user, targetUser, trx });
    }
  }

  function validateInputs() {
    return schema.validate({
      vote
    });
  }
}

const schema = yup.object().shape({
  vote: yup
    .number()
    .integer()
    .oneOf([1])
    .required()
});
