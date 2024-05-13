import _ from 'lodash';
import Bluebird from 'bluebird';
import { transaction } from 'objection';

import Comment from 'models/comment';
import Favourite from 'models/favourite';
import Forum from 'models/forum';
import Oil from 'models/oil';
import Post from 'models/post';
import Recipe from 'models/recipe';

import { emptyObjectChecker } from 'services/errors';

import newFavouriteNotification from '../notification/newFavourite';

export default async function toggleFavourite({ user, input: { favouriteableId, favouriteableType }, trx: extTrx }) {
  const internalTrx = _.isEmpty(extTrx);
  const trx = extTrx || (await transaction.start(Favourite.knex()));

  let dbFavourite;
  let favouriteable;

  // todo add favouriteable stats calcs to record number of favourites per favouriteable
  return Bluebird
    .resolve(getFavouriteable())
    .then(toggleTheFavourite)
    .then(updateFavouriteableStats)
    .then(favouritedNotificationIfRequired)
    .tapCatch(() => internalTrx && trx.rollback())
    .tap(() => internalTrx && trx.commit())
    .then(() => dbFavourite);

  // implementation

  function getFavouriteable() {
    const favouriteTypeMap = {
      comments: Comment,
      forums: Forum,
      oils: Oil,
      posts: Post,
      recipes: Recipe
    };

    const Model = favouriteTypeMap[favouriteableType];

    return Bluebird
      .resolve(
        Model
          .query(trx)
          .findById(favouriteableId)
      )
      .tap(emptyObjectChecker)
      .tap((res) => (favouriteable = res));
  }

  function toggleTheFavourite() {
    const packet = { favouriteableId, favouriteableType, userId: user.id };

    return Favourite
      .query(trx)
      .where(packet)
      .first()
      .then((res) => {
        if (_.isNil(res)) {
          return Favourite
            .query(trx)
            .insert(packet)
            .returning('*')
            .then(res2 => (dbFavourite = res2));
        } else {
          return res
            .$query(trx)
            .delete();
        }
      });
  }

  function updateFavouriteableStats() {
    const sql = `
WITH favourites_count AS (
    SELECT count(id) AS count
    FROM favourites
    WHERE favouriteable_id = :favouriteableId
    AND favouriteable_type = :favouriteableType
)

update :favouriteableType: favouriteableType SET
  stats = jsonb_set(
    coalesce(stats, '{}'::jsonb), 
    '{favourites}'::text[], jsonb_build_object('favourites', favourites_count.count),
    true
  )
from favourites_count 
  where favouriteableType.id = :favouriteableId  
  `;

    return trx.raw(sql, {
      favouriteableId,
      favouriteableType
    });
  }

  function favouritedNotificationIfRequired() {
    if (dbFavourite) {
      return newFavouriteNotification({
        favouriteable,
        favourite: dbFavourite,
        sourceUser: user,
        targetUser: { id: favouriteable.userId },
        trx
      });
    }
  }
}
