import _ from 'lodash';
import Bluebird from 'bluebird';
import { raw, transaction } from 'objection';

import Recipe from 'models/recipe';

import updateAdditivesRecipeCounts from 'schemas/services/additive/updateAdditivesRecipeCounts';
import updateOilsCounts from 'schemas/services/oil/updateOilsRecipeCounts';
import updateRecipeAdditives from 'schemas/services/additive/updateRecipeAdditives';
import updateRecipeOils from 'schemas/services/oil/updateRecipeOils';
import newPublicRecipe from 'schemas/services/feed/newPublicRecipe';

import { emptyObjectChecker, ForbiddenError } from 'services/errors';
import { stripAllHtml } from 'services/sanitiseHtml';

import validationSchema from './schema';
import clearRecipeImage from './clearRecipeImage';
import setRecipeImage from './setRecipeImage';

export default function updateRecipe({ user, id, recipe }) {
  let trx;
  let recipePayload;
  let additives;
  let oils;
  let dbRecipe;
  let recipeWasNotPublic;

  return Bluebird
    .resolve(transaction.start(Recipe.knex()))
    .then(res => (trx = res))
    .then(validateRecipe)
    .then(getRecipe)
    .then(checkIfCanEdit)
    .then(setRecipeImageIfProvided)
    .then(updateTheRecipe)
    .then(linkAdditivesToRecipe)
    .then(linkOilsToRecipe)
    .then(addRecipeToFeedIfChangingVisibility)
    .tapCatch(() => trx.rollback())
    .tap(() => trx.commit())
    .then(() => dbRecipe);

  // implementation

  function validateRecipe() {
    return validationSchema.validate(recipe, {
      abortEarly: false,
      stripUnknown: true
    })
      .then((value) => {
        additives = _.get(value, 'settings.additives');
        oils = _.get(value, 'settings.oils');
        recipePayload = _.omit(value, ['settings.oils']);
      });
  }


  function getRecipe() {
    return Bluebird
      .resolve(
        Recipe
          .query(trx)
          .findById(id)
      )
      .tap(emptyObjectChecker)
      .then(res => (dbRecipe = res))
      .then(() => {
        if (Number(dbRecipe.visibility) !== 1) {
          recipeWasNotPublic = true;
        }
      });
  }

  function checkIfCanEdit() {
    if (Number(user.id) !== Number(dbRecipe.userId)) {
      throw new ForbiddenError('Not object owner');
    }
  }

  function setRecipeImageIfProvided() {
    const { recipeImage, recipeImageSizeData } = recipe;

    if (recipeImage) {
      return setRecipeImage({ recipeImage, recipeImageSizeData, recipe: dbRecipe, user, trx });
    } else if (_.isNull(recipeImage)) {
      return clearRecipeImage({ recipe: dbRecipe, trx });
    }
  }

  function updateTheRecipe() {
    const { name, description, notes } = recipePayload;

    return dbRecipe
      .$query(trx)
      .patch({
        ...recipePayload,
        userId: user.id,
        weightedTsv: raw(
          "setweight(to_tsvector(COALESCE(:name,'')), 'A') || " +
          "setweight(to_tsvector(COALESCE(:description,'')), 'B') || " +
          "setweight(to_tsvector(COALESCE(:notes,'')), 'C')",
          {
            name,
            description: stripAllHtml(description),
            notes: stripAllHtml(notes)
          }
        ),
        updatedAt: new Date()
      })
      .returning('*')
      .first()
      .then(res => (dbRecipe = res));
  }

  function addRecipeToFeedIfChangingVisibility() {
    if (recipePayload.visibility === 1 && recipeWasNotPublic) {
      return newPublicRecipe({ user, recipe: dbRecipe, trx });
    }
  }

  function linkAdditivesToRecipe() {
    if (!(_.isEmpty(additives))) {
      return updateRecipeAdditives({ additives, recipeId: id, trx })
        .then(updates => updateAdditivesRecipeCounts({
          additiveIds: _.map(updates, 'additive_id'),
          trx
        }));
    }
  }

  function linkOilsToRecipe() {
    return updateRecipeOils({ oils, recipeId: id, trx })
      .then(updates => updateOilsCounts({
        oilIds: _.map(updates, 'oil_id'),
        trx
      }));
  }
}
