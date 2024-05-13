import _ from 'lodash';
import Bluebird from 'bluebird';
import { transaction } from 'objection';

import { ForbiddenError } from 'services/errors';
import Recipe from 'models/recipe';

import updateOilsCounts from 'schemas/services/oil/updateOilsRecipeCounts';
import updateUserKarma from 'schemas/services/user/updateUserKarma';


export default function deleteRecipe({ id, user }) {
  let trx;
  let dbRecipe;
  let oils;

  return Bluebird
    .resolve(transaction.start(Recipe.knex()))
    .then(res => (trx = res))
    .then(getRecipe)
    .then(checkIfCanEdit)
    .then(deleteTheRecipe)
    .then(updateOilsStats)
    .then(() => updateUserKarma({ trx, targetUser: user }))
    .tapCatch(() => trx.rollback())
    .tap(() => trx.commit())
    .then(() => dbRecipe);

  // implementation

  function getRecipe() {
    return Recipe
      .query(trx)
      .findById(id)
      .then(res => (dbRecipe = res));
  }

  function checkIfCanEdit() {
    if (Number(user.id) !== Number(dbRecipe.userId)) {
      throw new ForbiddenError('Not object owner');
    }
  }

  function deleteTheRecipe() {
    return dbRecipe
      .$query(trx)
      .delete();
  }

  function updateOilsStats() {
    return updateOilsCounts({
      oilIds: _.map(oils, oil => oil.id),
      trx
    });
  }
}
