import Recipe from 'models/recipe';

import getRecipes from 'schemas/services/recipe/getRecipes';
import summariser from 'services/summariser';

export default function getRecipesSummary(input) {
  const recipesQuery = getRecipes(input);

  return summariser(Recipe, recipesQuery);
}
