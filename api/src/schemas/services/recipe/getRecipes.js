import _ from 'lodash';

import Recipe from 'models/recipe';

import setQuerySearch from './setQuerySearch';
import setQueryOrder from './setQueryOrder';

export default function getRecipes({ user, page: { offset, limit } = {}, search, order }) {
  const recipes = Recipe.query();

  if (limit) {
    if (limit > 100) {
      throw new Error('invalid request');
    }

    recipes.limit(limit);
  }

  if (offset) {
    recipes.offset(offset);
  }

  setQueryOrder({ query: recipes, order });
  setQuerySearch({ query: recipes, search, user });

  // if user logged in also show their and their friends recipes
  // otherwise only show public recipes
  const userId = _.get(user, 'id');

  if (userId) {
    recipes.where((qb) => {
      // public recipes
      qb.where({
        visibility: 1
      });

      // my recipes
      qb.orWhere({
        userId
      });

      // todo - my friend's recipes
      // qb.orWhereExists((qb2) => {
      //   qb2
      //     .select('1')
      //     .from('recipes')
      //     .where({
      //       visibility: 2
      //     })
      //     .join('users', 'users.id', 'recipes.userId')
      // });
    });
  } else {
    recipes.where({
      visibility: 1
    });
  }

  return recipes;
}
