import _ from 'lodash';
import { useCreation } from 'ahooks';

import { recipeSummary } from 'services/calculator';

// returns array of [recipeForDisplay, additives]

export default function useRecipeToOilsAdditivesAndSummary({ recipe, oils }) {
  return useCreation(() => {
    const additives = _.map(recipe.recipeAdditives, additive => ({
      id: additive.additiveId,
      name: additive.additive.name,
      weight: additive.weight
    }));

    const recipeValues = {
      ...(_.get(recipe, 'settings') || {}),
      oils: _.map(recipe.recipeOils, oil => ({
        id: oil.oilId,
        weight: oil.weight
      }))
    };

    return [
      recipeSummary(recipeValues, oils),
      additives
    ];
  }, [oils, recipe]);
}
