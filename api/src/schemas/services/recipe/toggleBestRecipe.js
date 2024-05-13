import Bluebird from 'bluebird';
import { transaction } from 'objection';

import { emptyObjectChecker } from 'services/errors';
import Recipe from 'models/recipe';
import Friendship from 'models/friendship';

import newAwardedBestRecipe from 'schemas/services/notification/newAwardedBestRecipe';

export default async function toggleBestRecipe({ id, user }) {
  const trx = await transaction.start(Friendship.knex());

  return Bluebird
    .resolve(
      Recipe
        .query(trx)
        .findById(id)
    )
    .tap(emptyObjectChecker)
    .then(toggleBestFlagOnRecipe)
    .tap(notifyRecipeOwner)
    .tap(() => trx.commit())
    .tapCatch(() => trx.rollback());

  function toggleBestFlagOnRecipe(recipe) {
    return recipe
      .$query(trx)
      .patch({
        best: recipe.best ? null : true,
        bestAt: new Date()
      })
      .returning('*');
  }

  function notifyRecipeOwner(recipe) {
    if (recipe.best) {
      return newAwardedBestRecipe({ recipe, user, trx });
    }
  }
}
