import Recipe from 'models/recipe';
import RecipeJournal from 'models/recipeJournal';

import recipePermissionCheck from 'schemas/services/recipe/recipePermissionCheck';

export default async function getRecipeJournals({ search, user }) {
  const { recipeId } = search;
  const recipe = await Recipe.query().findById(recipeId);

  await recipePermissionCheck({ recipe, user });

  return RecipeJournal
    .query()
    .where({
      recipeId
    })
    .orderBy('createdAt', 'desc');
}
