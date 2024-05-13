import _ from 'lodash';
import Bluebird from 'bluebird';
import { raw, transaction } from 'objection';

import Additives from 'models/additive';
import RecipeAdditive from 'models/recipeAdditive';
import RecipeOil from 'models/recipeOil';
import Recipe from 'models/recipe';

import newPublicRecipe from 'schemas/services/feed/newPublicRecipe';
import updateAdditivesRecipeCounts from 'schemas/services/additive/updateAdditivesRecipeCounts';
import updateOilsCounts from 'schemas/services/oil/updateOilsRecipeCounts';
import newCopiedRecipe from 'schemas/services/notification/newCopiedRecipe';
import createVote from 'schemas/services/vote/createVote';

import { stripAllHtml } from 'services/sanitiseHtml';

import setRecipeImage from './setRecipeImage';
import validationSchema from './schema';

export default function createRecipe({ user, recipe }) {
  let trx;
  let dbAdditives;
  let dbRecipe;
  let additives;
  let oils;

  const fromRecipeId = _.get(recipe, 'fromRecipeId');

  return Bluebird
    .resolve(transaction.start(Recipe.knex()))
    .then(res => (trx = res))
    .then(validateRecipe)
    .then(createDbRecipe)
    .then(getAdditives)
    .then(linkOilsToRecipe)
    .then(linkAdditivesToRecipe)
    .then(updateOilsStats)
    .then(updateAdditivesStats)
    .then(setRecipeImageIfProvided)
    .then(upvoteMyRecipe)
    .then(addToFeedIfPublic)
    .then(addRecipeCopiedNotificationIfRequired)
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
        dbRecipe = _.omit(value, ['settings.oils']);
      });
  }

  function createDbRecipe() {
    const { name, description, notes } = dbRecipe;

    return Recipe
      .query(trx)
      .insert({
        ...dbRecipe,
        fromRecipeId,
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
        )
      })
      .returning('*')
      .then(res => (dbRecipe = res));
  }

  function getAdditives() {
    if (!(_.isEmpty(additives))) {
      return Additives
        .query(trx)
        .whereIn('id', _.map(additives, 'id'))
        .then((res) => (dbAdditives = res));
    }
  }

  function setRecipeImageIfProvided() {
    const { recipeImage, recipeImageSizeData } = recipe;

    if (recipeImage) {
      return setRecipeImage({ recipeImage, recipeImageSizeData, recipe: dbRecipe, user, trx });
    }
  }

  function linkOilsToRecipe() {
    const payload = _.map(oils, oil => ({
      recipeId: dbRecipe.id,
      oilId: oil.id,
      weight: oil.weight
    }));

    return RecipeOil
      .query(trx)
      .insert(payload);
  }

  function linkAdditivesToRecipe() {
    if (!(_.isEmpty(additives))) {
      const additiveWeightLookup = _.keyBy(additives, 'id');
      const additivesNameDbLookup = _.chain(dbAdditives)
        .map((additive) => ({
          ...additive,
          weight: additiveWeightLookup[additive.id]?.weight
        }))
        .keyBy(({ name }) => _.toLower(name))
        .value();

      // check if copying recipe with additives - if so, need my own copy of the additives
      const additivesToCopy = _.filter(dbAdditives, ({ userId }) => String(userId) !== String(user.id));

      return Bluebird
        .try(() => {
          if (!(_.isEmpty(additivesToCopy))) {
            const payload = _.map(additivesToCopy, ({ name, notes }) => ({ name, notes, userId: user.id }));
            const findTuples = _.map(dbAdditives, ({ name }) => ([_.toLower(name), user.id]));

            /* eslint-disable max-len */
            const insertStatement = Additives.query().insert(payload).toKnexQuery().toString().replace('returning "id"', '');
            const findStatement = Additives.query().whereIn(raw('(name, user_id)'), findTuples).toKnexQuery().toString();
            /* eslint-enable max-len */

            // attempt to insert copied additives - dupe names will be rejected and these will be selected instead
            return trx.raw(`
              with copy_additives as (
                ${insertStatement}
                  on conflict (user_id, LOWER(name)) where (deleted_at is null) DO NOTHING
                returning *
              ), my_additives_by_lower_name as (
                ${findStatement} 
              )
                select * from copy_additives
                UNION
                select * from my_additives_by_lower_name 
            `)
              .then(({ rows }) => {
                return _.map(rows, ({ id, name }) => ({
                  recipeId: dbRecipe.id,
                  additiveId: id,
                  weight: additivesNameDbLookup[_.toLower(name)]?.weight
                }));
              });
          } else {
            return _.map(additives, additive => ({
              recipeId: dbRecipe.id,
              additiveId: additive.id,
              weight: additive.weight
            }));
          }
        })
        .then((payload) => RecipeAdditive
          .query(trx)
          .insert(payload)
          .returning('*')
        )
        // requery the additives here incase some were copied - we want the copied references no the original
        .then((recipeAdditives) => Additives
          .query(trx)
          .whereIn('id', _.map(recipeAdditives, 'additiveId'))
        )
        .then((res) => (additives = res));
    }
  }

  function updateOilsStats() {
    return updateOilsCounts({
      oilIds: _.map(oils, 'id'),
      trx
    });
  }

  function updateAdditivesStats() {
    return updateAdditivesRecipeCounts({
      additiveIds: _.map(additives, 'id'),
      trx
    });
  }

  function upvoteMyRecipe() {
    return createVote({
      trx,
      user,
      input: {
        voteableId: dbRecipe.id,
        voteableType: 'recipes',
        vote: 1
      }
    });
  }

  function addToFeedIfPublic() {
    if (dbRecipe.visibility === 1) {
      return newPublicRecipe({ recipe: dbRecipe, user, trx });
    }
  }

  function addRecipeCopiedNotificationIfRequired() {
    if (fromRecipeId) {
      return Recipe
        .query(trx)
        .findById(fromRecipeId)
        .then((res) => {
          if (res && res.userId !== dbRecipe.userId) {
            return newCopiedRecipe({
              sourceUser: user,
              targetUserId: res.userId,
              newRecipe: dbRecipe,
              fromRecipeId,
              trx
            });
          }
        });
    }
  }
}
