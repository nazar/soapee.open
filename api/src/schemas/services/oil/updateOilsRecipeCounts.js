import _ from 'lodash';

import { jsonArrayToPgParams } from 'services/knex';

export default function updateOilsCounts({ oilIds, trx }) {
  if (!(_.isEmpty(oilIds))) {
    return trx.raw(`
with oilCounts as (
  select recipe_oils.oil_id as oilId,
         count(recipe_oils.recipe_id) as oilCount
  from recipe_oils 
  where recipe_oils.oil_id IN (${jsonArrayToPgParams(oilIds)})  
  group by recipe_oils.oil_id
)

update oils set
  stats = jsonb_set(
    coalesce(stats, '{}'::jsonb),
    '{recipes}'::text[],
    jsonb_build_object('count', oilCounts.oilCount))
from oilCounts
where oilCounts.oilId = oils.id  
  `, [...oilIds]);
  }
}
