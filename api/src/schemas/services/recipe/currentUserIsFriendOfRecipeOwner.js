import _ from 'lodash';

import User from 'models/user';
import { UserInputError } from 'services/errors';

export default function currentUserIsFriendOfRecipeOwner({ recipe, userId }) {
  return User
    .query()
    .findById(recipe.userId)
    .then((recipeOwner) => {
      return recipeOwner
        .$relatedQuery('friends')
        .where({ 'friendships.friendId': userId })
        .then((friend) => {
          if (_.isEmpty(friend)) {
            throw new UserInputError('Recipe is private and can only be viewed by its owner or the owner friends', {
              code: 'private_recipe'
            });
          }
        });
    });
}
