import _ from 'lodash';

import Feed from 'models/feed';

export default function newRecipeJournal({ recipeJournal, recipe, user, trx }) {
  return Feed
    .query(trx)
    .insert({
      feedableId: recipeJournal.id,
      feedableType: 'recipe_journals',
      userId: user.id,
      feedMeta: {
        type: 'newRecipeJournal',
        v: 1,
        recipe: _.pick(recipe, ['id', 'name'])
      }
    })
    .returning('*');
}
