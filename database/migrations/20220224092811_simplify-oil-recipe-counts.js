exports.up = function(knex) {
  return knex
    .raw(`
with oilCounts as (
  select recipe_oils.oil_id as oilId,
         count(recipe_oils.recipe_id) as oilCount
  from recipe_oils 
  group by recipe_oils.oil_id
)

update oils set
  stats = jsonb_set(
    coalesce(stats, '{}'::jsonb),
    '{recipes}'::text[],
    jsonb_build_object('count', oilCounts.oilCount))
from oilCounts
where oilCounts.oilId = oils.id    
    `)
};

exports.down = function(knex) {
  return knex
    .raw(`
with oilCounts as (
  select recipe_oils.oil_id as oilId,
         count(recipes.id) as oilCount
  from recipe_oils 
    inner join recipes on recipe_oils.recipe_id = recipes.id 
      and recipes.visibility = 1 
      and recipes.deleted_at is null
  group by recipe_oils.oil_id
)

update oils set
  stats = jsonb_set(
    coalesce(stats, '{}'::jsonb),
    '{recipes}'::text[],
    jsonb_build_object('count', oilCounts.oilCount))
from oilCounts
where oilCounts.oilId = oils.id      
    `)
};
