import { raw } from 'objection';

import Recipe from 'models/recipe';

import setQueryOrder from './setQueryOrder';
import setQuerySearch from './setQuerySearch';

export default function getFavouriteRecipesForUser({ user, offset, limit, order, search }) {
  const userId = user.id;

  // these are all my favourite recipes
  // but we need to exclude recipes from friends that are:
  // 1. no longer visibility of friends - my friends might have made their recipes private after I faved them
  // 2. no longer my friends - either I or they unfriended me or unconfirmed friendships

  const favouriteRecipesThatAreMine = Recipe
    .query()
    .select('recipes.*')
    .join('favourites', {
      'favourites.favouriteableId': 'recipes.id',
      'favourites.favouriteableType': raw("'recipes'")
    })
    .where('favourites.userId', '=', userId)
    .where('recipes.userId', '=', userId);

  const favouriteRecipesThatArePublic = Recipe
    .query()
    .select('recipes.*')
    .join('favourites', {
      'favourites.favouriteableId': 'recipes.id',
      'favourites.favouriteableType': raw("'recipes'")
    })
    .where('recipes.visibility', 1)
    .where('favourites.userId', '=', userId);

  const favouriteRecipesThatAreMyFriends = Recipe
    .query()
    .select('recipes.*')
    .join('favourites', {
      'favourites.favouriteableId': 'recipes.id',
      'favourites.favouriteableType': raw("'recipes'")
    })
    .whereIn('recipes.visibility', [1, 2])
    .join('friendships', {
      'friendships.userId': 'favourites.userId'
    })
    .join('users as friends', {
      'friends.id': 'friendships.friendId',
      'recipes.userId': 'friends.id'
    })
    .whereRaw(`
      exists( 
        select 1 
        from friendships f 
        where f.friend_id = friendships.user_id 
        and f.user_id = friendships.friend_id 
      )
    `)
    .where('favourites.userId', '=', userId)
    .where('friendships.userId', '=', userId);

  const myFavouriteRecipes = Recipe
    .query()
    .with(
      'favourite_recipes',
      favouriteRecipesThatAreMine
        .union(favouriteRecipesThatArePublic)
        .union(favouriteRecipesThatAreMyFriends)
    )
    .from('favourite_recipes');

  if (limit) {
    myFavouriteRecipes.limit(limit);
  }

  if (offset) {
    myFavouriteRecipes.offset(offset);
  }

  setQuerySearch({ query: myFavouriteRecipes, search, user, tableName: 'favourite_recipes' });
  setQueryOrder({ query: myFavouriteRecipes, order, tableName: 'favourite_recipes' });

  return myFavouriteRecipes;
}
