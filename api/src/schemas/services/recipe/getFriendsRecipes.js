import _ from 'lodash';
import { raw } from 'objection';

import Recipe from 'models/recipe';

import setQuerySearch from './setQuerySearch';
import setQueryOrder from './setQueryOrder';

export default function getFavouriteRecipesForUser({ user, page, order, search }) {
  const userId = user.id;

  return _.tap(Recipe.query(), (query) => {
    query
      .whereExists((qb) => {
        qb
          .select('r.id')
          .from('recipes as r')
          .select('friendships.friendId')
          .join('users', { 'r.userId': 'users.id', 'r.visibility': 2 })
          .join('friendships', { 'friendships.userId': 'users.id' })
          .join('users as friends', 'friends.id', 'friendships.friendId')
          .where('friendships.friendId', userId)
          .where({ 'r.id': raw('recipes.id') })
          // check for symmetric relationships
          .whereRaw(`
        exists( 
          select 1 
          from friendships f 
          where f.friend_id = friendships.user_id 
          and f.user_id = friendships.friend_id 
        )
      `);
      });

    setQuerySearch({ query, search, user });
    setQueryOrder({ query, order });

    if (page?.limit) {
      query.limit(page.limit);
    }

    if (page?.offsetoffset) {
      query.offset(page.offset);
    }
  });
}
