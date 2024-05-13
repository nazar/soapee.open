import _ from 'lodash';
import Bluebird from 'bluebird';

import { UserInputError } from 'services/errors';
import Recipe from 'models/recipe';

import recipePermissionCheck from './recipePermissionCheck';

export default function getRecipe({ id, user }) {
  const userId = _.get(user, 'id');

  return Bluebird
    .resolve(
      Recipe
        .query()
        .whereNotDeleted()
        .findById(id)
    )
    .tap((recipe) => {
      if (_.isEmpty(recipe)) {
        throw new UserInputError('Recipe not found', {
          subtitle: 'Could not find this recipe. It might have been deleted by its owner'
        });
      } else {
        return recipePermissionCheck({ recipe, user });
      }
    })
    .tap(updateRecipeViewCountStats);

  // private

  function updateRecipeViewCountStats(recipe) {
    // increment view counts only if someone else looks at my recipe
    if (Number(recipe.userId) !== Number(userId)) {
      return Recipe
        .knex()
        .raw(`
          with recipeViews as (
            select id,
              jsonb_set(
                coalesce(stats, '{}'::jsonb),
                '{views}',
                jsonb_build_object('count', sum(coalesce((recipes.stats #> '{views,count}')::int, 0)) + 1),
                true
              ) as stats
            from recipes
            where id = :recipeId
            group by id, stats
          )
          
          update recipes set
            stats = recipeViews.stats
          from recipeViews
          where recipes.id = recipeViews.id
        `, { recipeId: recipe.id });
    }
  }
}
