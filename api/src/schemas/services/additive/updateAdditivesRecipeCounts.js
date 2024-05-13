import _ from 'lodash';

import { jsonArrayToPgParams } from 'services/knex';

export default function updateAdditivesRecipeCounts({ additiveIds, trx }) {
  if (!(_.isEmpty(additiveIds))) {
    return trx.raw(`
with additiveCounts as (
  select recipe_additives.additive_id as additiveId,
         count(recipe_additives.recipe_id) as additiveCount
  from recipe_additives 
  where recipe_additives.additive_id IN (${jsonArrayToPgParams(additiveIds)})  
  group by recipe_additives.additive_id
)

update additives set
  stats = jsonb_set(
    coalesce(stats, '{}'::jsonb),
    '{recipes}'::text[],
    jsonb_build_object('count', additiveCounts.additiveCount)),
  updated_at = now()                   
from additiveCounts
where additiveCounts.additiveId = additives.id  
  `, additiveIds);
  }
}
