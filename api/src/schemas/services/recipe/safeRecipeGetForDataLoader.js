import Bluebird from 'bluebird';

import recipePermissionCheck from './recipePermissionCheck';

export default function safeRecipeGetForDataLoader({ user, loaders, fromRecipeId }) {
  if (fromRecipeId) {
    return Bluebird
      .resolve(loaders.recipeById.load(fromRecipeId))
      .then(recipe => {
        if (recipe) {
          try {
            return Bluebird
              .resolve(recipePermissionCheck({ recipe: recipe, user }))
              .then(() => recipe);
          } catch (e) {
            return null;
          }
        }
      });
  }
}
