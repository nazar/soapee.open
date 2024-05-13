export default function getCollectionSummary(Model, query) {
  // wrap in a subquery to extract the number of returned results - 💖 objection and knex
  return Model
    .query()
    .with(
      'pager_subquery',
      query
    )
    .count()
    .from('pager_subquery')
    .first();
}
