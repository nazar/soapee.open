import _ from 'lodash';

import RecipeOil from 'models/recipeOil';

export default function updateRecipeOils({ recipeId, oils, trx }) {
  const inserts = _.map(
    oils,
    ({ id: oilId, weight }) => ({ recipeId, oilId, weight, updatedAt: 'now()', createdAt: 'now()' })
  );

  const oilIds = _.chain(oils).map('id').join(',').thru(t => `${t}`).value();
  const insertStatement = RecipeOil.query().insert(inserts).toKnexQuery().toString().replace('returning "id"', '');

  return trx.raw(`
    with insert_recipes_oils as (
      ${insertStatement}
        on conflict (recipe_id, oil_id) DO UPDATE SET 
          weight = EXCLUDED.weight, 
          updated_at = now() 
        where recipe_oils.weight != EXCLUDED.weight
      returning *  
    ), delete_recipe_oils as (
      delete from recipe_oils 
      where recipe_id = :recipeId
      and oil_id not in (${oilIds})
      returning *
    )
    
    SELECT *, 'inserted' AS operation FROM insert_recipes_oils
    UNION
    SELECT *, 'deleted' AS operation FROM delete_recipe_oils
  `, {
    oilIds,
    recipeId
  })
    .then(({ rows }) => rows);
}
