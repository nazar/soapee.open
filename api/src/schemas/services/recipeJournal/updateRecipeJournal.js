import * as yup from 'yup';

import Recipe from 'models/recipe';
import RecipeJournal from 'models/recipeJournal';

import { yupStringSanitize } from 'services/sanitiseHtml';
import { validate } from 'services/yup';
import { ForbiddenError } from 'services/errors';


export default async function updateRecipeJournal({ id, input, user }) {
  const recipeJournal = await RecipeJournal.query().findById(id);
  const recipe = await Recipe.query().findById(recipeJournal.recipeId);

  if (Number(recipe.userId) !== Number(user.id)) {
    throw new ForbiddenError('Can only create journal entry for your own recipes');
  }

  const payload = await validate(input, schema);

  return recipeJournal
    .$query()
    .patch(payload)
    .returning('*');
}

const schema = yup.object({
  journal: yup.string().transform(yupStringSanitize).required()
});
