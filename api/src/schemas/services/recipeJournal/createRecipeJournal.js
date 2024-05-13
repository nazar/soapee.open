import Bluebird from 'bluebird';
import { transaction } from 'objection';
import * as yup from 'yup';

import Recipe from 'models/recipe';
import RecipeJournal from 'models/recipeJournal';

import newRecipeJournal from 'schemas/services/feed/newRecipeJournal';

import { yupStringSanitize } from 'services/sanitiseHtml';
import { validate } from 'services/yup';
import { ForbiddenError } from 'services/errors';


export default async function createRecipeJournal({ input, user }) {
  const { recipeId } = input;
  const recipe = await Recipe.query().findById(recipeId);

  if (Number(recipe.userId) !== Number(user.id)) {
    throw new ForbiddenError('Can only create journal entry for your own recipes');
  }

  const payload = await validate(input, schema);

  let trx;
  let dbRecipeJournal;

  return Bluebird
    .resolve(transaction.start(RecipeJournal.knex()))
    .then(res => (trx = res))
    .then(createDbRecipeJournal)
    .then(addJournalToFeedIfPublicRecipe)
    .tapCatch(() => trx.rollback())
    .tap(() => trx.commit())
    .then(() => dbRecipeJournal);

  //

  function createDbRecipeJournal() {
    return RecipeJournal
      .query(trx)
      .insert(payload)
      .returning('*')
      .then(res => (dbRecipeJournal = res));
  }

  function addJournalToFeedIfPublicRecipe() {
    if (recipe.visibility === 1) {
      return newRecipeJournal({ recipeJournal: dbRecipeJournal, recipe, user, trx });
    }
  }
}

const schema = yup.object({
  journal: yup.string().transform(yupStringSanitize).required(),
  recipeId: yup.string().required()
});
