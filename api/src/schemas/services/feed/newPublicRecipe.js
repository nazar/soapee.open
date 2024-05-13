import _ from 'lodash';

import Feed from 'models/feed';

export default function newPublicRecipe({ recipe, user, trx }) {
  return Feed
    .query(trx)
    .insert({
      feedableId: recipe.id,
      feedableType: 'recipes',
      userId: user.id,
      feedMeta: {
        type: 'newPublicRecipe',
        v: 1,
        recipe: _.pick(recipe, ['id', 'name'])
      }
    })
    .returning('*');

  // todo - once feeds_users is added, check if this recipe is a friends recipe or
  // todo - a recipe of someone recipeUser follows
}
