import _ from 'lodash';

import RecipeAdditive from 'models/recipeAdditive';

export default function updateRecipeAdditives({ recipeId, additives, trx }) {
  const inserts = _.map(
    additives,
    ({ id: additiveId, weight }) => ({ recipeId, additiveId, weight, updatedAt: 'now()', createdAt: 'now()' })
  );

  const additiveIdIds = _.chain(additives).map('id').join(',').thru(t => `${t}`).value();
  const insertStatement = RecipeAdditive.query().insert(inserts).toKnexQuery().toString().replace('returning "id"', '');

  return trx.raw(`
    with insert_recipes_additives as (
      ${insertStatement}
        on conflict (recipe_id, additive_id) DO UPDATE SET 
          weight = EXCLUDED.weight, 
          updated_at = now() 
        where recipe_additives.weight != EXCLUDED.weight
      returning *  
    ), delete_recipe_additives as (
      delete from recipe_additives 
      where recipe_id = :recipeId
      and additive_id not in (${additiveIdIds})
      returning *
    )
    
    SELECT *, 'inserted' AS operation FROM insert_recipes_additives
    UNION
    SELECT *, 'deleted' AS operation FROM delete_recipe_additives
  `, {
    additiveIdIds,
    recipeId
  })
    .then(({ rows }) => rows);
}
