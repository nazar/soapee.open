import _ from 'lodash';
import Bluebird from 'bluebird';
import { transaction } from 'objection';

import User from 'models/user';


// target user is the user for which karma is being calculated
export default async function updateUserKarma({ targetUser, trx: extTrx }) {
  const trx = extTrx || (await transaction.start(User.knex()));
  const intTrx = _.isNil(extTrx);

  if (_.isNil(targetUser)) {
    throw new Error('targetUser is null');
  }
  // todo consider dropping stats and only recording karma
  const sql = `
WITH posts_count AS (
    SELECT count(id) AS count
    FROM posts
    WHERE posts.user_id = :userId
), comments_count AS (
    SELECT count(id)
    FROM comments
    WHERE comments.user_id = :userId
), forums_count AS (
    SELECT count(id)
    FROM forums
    WHERE forums.user_id = :userId
), recipes_count AS (
    SELECT count(id)
    FROM recipes
    WHERE recipes.user_id = :userId
    AND recipes.deleted_at is null
), votes_count AS (
    SELECT count(id)
    FROM votes
    WHERE votes.user_id = :userId
), posts_karma AS (
    SELECT sum(votes.vote) sum_posts
    FROM votes
      INNER JOIN posts
        ON votes.voteable_id = posts.id
           AND votes.voteable_type = 'posts'
    WHERE posts.user_id = :userId       
), comments_karma AS (
    SELECT sum(votes.vote) sum_comments
    FROM votes
      INNER JOIN comments
        ON votes.voteable_id = comments.id
           AND votes.voteable_type = 'comments'
    WHERE comments.user_id = :userId        
), recipes_karma AS (
    SELECT sum(votes.vote) sum_recipes
    FROM votes
      INNER JOIN recipes
        ON votes.voteable_id = recipes.id
           AND votes.voteable_type = 'recipes'
    WHERE recipes.user_id = :userId   
    AND recipes.deleted_at is null     
), stats AS (
    SELECT jsonb_build_object(
               'posts', posts_count.count,
               'comments', comments_count.count,
               'forums', forums_count.count,
               'recipes', recipes_count.count,
               'votes', votes_count.count
           ) stats
    FROM posts_count, comments_count, forums_count, recipes_count, votes_count
), karma AS (
    SELECT jsonb_build_object(
               'posts', posts_karma.sum_posts,
               'comments', comments_karma.sum_comments,
               'recipes', recipes_karma.sum_recipes
           ) karma
    FROM posts_karma, comments_karma, recipes_karma
), user_stats AS (
    SELECT jsonb_build_object('counts', stats.stats, 'karma', karma.karma) stats
    FROM stats, karma
)

update users SET
  stats = coalesce(users.stats, '{}'::jsonb) || user_stats.stats
from user_stats
  where users.id = :userId  
  `;

  return Bluebird.resolve(trx.raw(sql, { userId: targetUser.id }))
    .then(() => intTrx && trx.commit())
    .tapCatch(() => intTrx && trx.rollback());
}
