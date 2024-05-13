import _ from 'lodash';

import { UserInputError } from 'services/errors';

import currentUserIsFriendOfRecipeOwner from './currentUserIsFriendOfRecipeOwner';

export default function recipePermissionCheck({ recipe, user }) {
  const userId = user?.id;

  // visibility 0 - private
  // visibility 1 - public
  // visibility 2 - friends only

  // check recipe visibility before we return it.
  // private recipes can only be viewed by the recipe owner
  // friends recipes can only be viewed by friends
  // public recipes can be viewed by anyone

  if (Number(recipe.visibility) === 0) {
    if (Number(recipe.userId) !== Number(userId)) {
      throw new UserInputError('Recipe is private and can only be viewed by its owner', { code: 'private_recipe' });
    }
  } else if (Number(recipe.visibility) === 2) {
    if (_.isEmpty(user)) {
      throw new UserInputError('Recipe is private and can only be viewed by its owner or the owner friends', {
        code: 'private_recipe'
      });
    } else if (Number(userId) !== Number(recipe.userId)) {
      return currentUserIsFriendOfRecipeOwner({ recipe, userId });
    }
  }
}
